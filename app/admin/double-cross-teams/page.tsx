'use client'

import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Download, Users, Filter } from 'lucide-react'

type TeamMember = {
  srNo: number
  phoneNumber: string
  teamName: string
  memberName: string
  teamColor: string
  role: string
}

export default function DoublerossTeamDashboard() {
  const [rows, setRows] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof TeamMember | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [teamFilter, setTeamFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/files/double-cross.csv')
      const text = await response.text()
      
      // Parse CSV
      const lines = text.split('\n').filter(line => line.trim())
      const data = lines.slice(1).map((line, index) => {
        const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''))
        
        // Transform role: empty = "LOYAL", "T" = "TRAITOR"
        let role = columns[5] || ''
        if (!role || role.trim() === '') {
          role = 'LOYAL'
        } else if (role.toUpperCase() === 'T') {
          role = 'TRAITOR'
        }
        
        return {
          srNo: parseInt(columns[0]) || index + 1,
          phoneNumber: columns[1] || '',
          teamName: columns[2] || '',
          memberName: columns[3] || '',
          teamColor: columns[4] || '',
          role: role
        }
      }).filter(item => item.phoneNumber && item.teamName)
      
      setRows(data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to load team data:', err)
      setError('Failed to load team data')
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const refresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  // Get unique teams and roles for filters
  const uniqueTeams = useMemo(() => {
    return Array.from(new Set(rows.map(r => r.teamName))).sort()
  }, [rows])

  const uniqueRoles = useMemo(() => {
    return Array.from(new Set(rows.map(r => r.role))).sort()
  }, [rows])

  // Filter data
  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      const teamMatch = teamFilter === 'all' || row.teamName === teamFilter
      const roleMatch = roleFilter === 'all' || row.role === roleFilter
      return teamMatch && roleMatch
    })
  }, [rows, teamFilter, roleFilter])

  // Sort filtered data
  const sortedRows = useMemo(() => {
    if (!sortField) return filteredRows
    
    const sorted = [...filteredRows].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      return 0
    })
    
    return sorted
  }, [filteredRows, sortField, sortDirection])

  const handleSort = (field: keyof TeamMember) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const stats = useMemo(() => {
    const total = filteredRows.length
    const loyals = filteredRows.filter(r => r.role === 'LOYAL').length
    const traitors = filteredRows.filter(r => r.role === 'TRAITOR').length
    const teams = new Set(filteredRows.map(r => r.teamName)).size
    return { total, loyals, traitors, teams }
  }, [filteredRows])

  const exportToExcel = () => {
    // Create CSV content from filtered/sorted data
    const header = ['Sr_No', 'Phone_Number', 'Team_Name', 'Member_Name', 'Team_Color', 'Role']
    const csvRows = sortedRows.map(r => ({
      srNo: r.srNo,
      phoneNumber: r.phoneNumber,
      teamName: r.teamName,
      memberName: r.memberName,
      teamColor: r.teamColor,
      role: r.role
    }))

    const csv = [
      header,
      ...csvRows.map(r => [
        r.srNo,
        r.phoneNumber,
        r.teamName,
        r.memberName,
        r.teamColor,
        r.role
      ])
    ]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `double-cross-teams-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportWithoutRole = () => {
    // Create CSV content WITHOUT role column
    const header = ['Sr_No', 'Phone_Number', 'Team_Name', 'Member_Name', 'Team_Color']
    const csvRows = sortedRows.map(r => ({
      srNo: r.srNo,
      phoneNumber: r.phoneNumber,
      teamName: r.teamName,
      memberName: r.memberName,
      teamColor: r.teamColor
    }))

    const csv = [
      header,
      ...csvRows.map(r => [
        r.srNo,
        r.phoneNumber,
        r.teamName,
        r.memberName,
        r.teamColor
      ])
    ]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `double-cross-teams-no-role-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-rose-600 mx-auto mb-4'/>
        <p className='text-gray-600'>Loading team data...</p>
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-neutral-900 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {error && (
          <div className='mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-2 text-sm text-red-700 dark:text-red-200'>
            {error}
          </div>
        )}

        {/* Header */}
        <div className='mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1'>Double-Cross Team Dashboard</h1>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>Complete team roster with roles</p>
          </div>
          <div className='flex gap-2'>
            <button 
              onClick={refresh} 
              disabled={refreshing} 
              className='bg-rose-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-rose-700 transition-colors flex items-center disabled:opacity-50 text-sm'
            >
              <RefreshCw size={14} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`}/>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              onClick={exportToExcel} 
              disabled={sortedRows.length === 0} 
              className='bg-emerald-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center disabled:opacity-50 text-sm'
            >
              <Download size={14} className='mr-2'/>
              Export Excel
            </button>
            <button 
              onClick={exportWithoutRole} 
              disabled={sortedRows.length === 0} 
              className='bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 text-sm'
            >
              <Download size={14} className='mr-2'/>
              Export (No Role)
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6'>
          <Card title='Total Members' value={stats.total} color='bg-gray-100 text-gray-800'/>
          <Card title='Teams' value={stats.teams} color='bg-blue-100 text-blue-800'/>
          <Card title='Loyals' value={stats.loyals} color='bg-green-100 text-green-800'/>
          <Card title='Traitors' value={stats.traitors} color='bg-red-100 text-red-800'/>
        </div>

        {/* Filters */}
        <div className='bg-white dark:bg-neutral-800 rounded-lg shadow dark:shadow-neutral-950 p-4 mb-6'>
          <div className='flex items-center gap-2 mb-3'>
            <Filter size={18} className='text-gray-600 dark:text-gray-400'/>
            <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>Filters</h2>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Team Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Team</label>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className='w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400'
              >
                <option value='all'>All Teams</option>
                {uniqueTeams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className='w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400'
              >
                <option value='all'>All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(teamFilter !== 'all' || roleFilter !== 'all') && (
            <button
              onClick={() => { setTeamFilter('all'); setRoleFilter('all'); }}
              className='mt-3 text-sm text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium'
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Table */}
        {sortedRows.length === 0 ? (
          <div className='text-center py-16 bg-white dark:bg-neutral-800 rounded-lg shadow dark:shadow-neutral-950'>
            <Users className='mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4'/>
            <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100 mb-2'>No data found</h3>
            <p className='text-gray-500 dark:text-gray-400'>Try adjusting your filters or refresh the data.</p>
          </div>
        ) : (
          <div className='bg-white dark:bg-neutral-800 rounded-lg shadow dark:shadow-neutral-950 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                <thead className='bg-gray-50 dark:bg-neutral-900'>
                  <tr>
                    <th 
                      className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800'
                      onClick={() => handleSort('srNo')}
                    >
                      Sr No {sortField === 'srNo' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800'
                      onClick={() => handleSort('phoneNumber')}
                    >
                      Phone Number {sortField === 'phoneNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800'
                      onClick={() => handleSort('teamName')}
                    >
                      Team Name {sortField === 'teamName' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800'
                      onClick={() => handleSort('memberName')}
                    >
                      Member Name {sortField === 'memberName' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800'
                      onClick={() => handleSort('teamColor')}
                    >
                      Team Color {sortField === 'teamColor' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800'
                      onClick={() => handleSort('role')}
                    >
                      Role {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700'>
                  {sortedRows.map((row, idx) => (
                    <tr key={`${row.srNo}-${row.phoneNumber}`} className='hover:bg-gray-50 dark:hover:bg-neutral-700 odd:bg-gray-50/40 dark:odd:bg-neutral-900/40'>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>{row.srNo}</td>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300 font-medium'>{row.phoneNumber}</td>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>{row.teamName}</td>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>{row.memberName}</td>
                      <td className='px-4 py-2 text-sm'>
                        <div className='flex items-center gap-2'>
                          <div 
                            className='h-4 w-4 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0'
                            style={{ backgroundColor: row.teamColor }}
                          />
                          <span className='text-gray-700 dark:text-gray-300 capitalize'>{row.teamColor}</span>
                        </div>
                      </td>
                      <td className='px-4 py-2 text-sm'>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          row.role === 'TRAITOR' 
                            ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200' 
                            : 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200'
                        }`}>
                          {row.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Card({ title, value, color }: { title: string; value: number | string; color: string }) {
  return (
    <div className={`rounded-lg p-3 sm:p-4 ${color} dark:bg-opacity-20 text-center`}> 
      <div className='text-xs text-gray-600 dark:text-gray-400'>{title}</div>
      <div className='text-2xl font-semibold dark:text-gray-200'>{value}</div>
    </div>
  )
}
