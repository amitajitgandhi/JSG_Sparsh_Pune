'use client'

import React, { useState, useEffect } from 'react'
import { Users, Phone, Trophy, ExternalLink, ChevronDown, ChevronUp, Loader2, ArrowLeft, Copy, Download, Check, FileSpreadsheet, Edit3, Save, X, Plus, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import AdminAuthModal from '@/app/components/AdminAuthModal'

// Define the squad member interface
interface SquadMember {
  'Player Name': string
  'Mobile Number': number | string
  'Jersey Size'?: string
  'Jersey Number'?: number | string
  'Jersey Name'?: string
  'Cric Heroes Link'?: string  
  'Team Name': string
  'JERSEY COLOR'?: string
  Age?: number // KIDS squad has age field
}

// Team colors for consistent theming
const teamColors = [
  'from-blue-500 to-blue-600',
  'from-red-500 to-red-600',
  'from-green-500 to-green-600',
  'from-purple-500 to-purple-600',
  'from-yellow-500 to-yellow-600',
  'from-pink-500 to-pink-600',
  'from-indigo-500 to-indigo-600',
  'from-orange-500 to-orange-600',
  'from-teal-500 to-teal-600',
  'from-gray-500 to-gray-600',
  'from-cyan-500 to-cyan-600',
]

export default function SPL02Squad() {
  const [mensSquad, setMensSquad] = useState<SquadMember[]>([])
  const [womensSquad, setWomensSquad] = useState<SquadMember[]>([])
  const [kidsSquad, setKidsSquad] = useState<SquadMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'MENS' | 'WOMENS' | 'KIDS'>('MENS')
  const [expandedTeams, setExpandedTeams] = useState<{[key: string]: boolean}>({})
  const [copiedTeam, setCopiedTeam] = useState<string | null>(null)
  const [exportingTeam, setExportingTeam] = useState<string | null>(null)
  
  // Admin authentication state
  const [showAdminAuth, setShowAdminAuth] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [pendingEditMember, setPendingEditMember] = useState<SquadMember | null>(null)
  
  // Inline edit state
  const [editingMember, setEditingMember] = useState<string | null>(null) // Using unique key for member
  const [editValues, setEditValues] = useState<{
    'Jersey Name': string
    'Jersey Number': string
    'Jersey Size': string
  }>({
    'Jersey Name': '',
    'Jersey Number': '',
    'Jersey Size': ''
  })
  const [savingMember, setSavingMember] = useState<string | null>(null)

  // Add new player state
  const [addingPlayerTeam, setAddingPlayerTeam] = useState<string | null>(null)
  const [newPlayer, setNewPlayer] = useState<{
    'Player Name': string
    'Mobile Number': string
    Age?: string
    'Jersey Name': string
    'Jersey Number': string
    'Jersey Size': string
    'Cric Heroes Link': string
  }>({
    'Player Name': '',
    'Mobile Number': '',
    Age: '',
    'Jersey Name': '',
    'Jersey Number': '',
    'Jersey Size': '',
    'Cric Heroes Link': ''
  })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // Jersey size options (updated list with measurements)
  const jerseySizeOptions = [
    '22', '24', '26', '28', '30', '32',
    'SX (34)', 'S (36)', 'M (38)', 'L (40)', 'XL (42)',
    '2XL (44)', '3XL (46)', '4XL (48)', '5XL (50)'
  ]

  // Generate unique key for member
  const getMemberKey = (member: SquadMember) => {
    return `${member['Player Name']}-${member['Mobile Number']}-${member['Team Name']}`
  }

  useEffect(() => {
    const fetchSquads = async () => {
      try {
        setLoading(true)
        // Try dynamic API first (reflects edits), fall back to static JSON if fails
        let apiData: any = null
        try {
          const apiRes = await fetch('/api/get-squads', { cache: 'no-store' })
          if (apiRes.ok) {
            apiData = await apiRes.json()
          }
        } catch (e) {
          console.warn('Dynamic API fetch failed, falling back to static JSON', e)
        }

        if (apiData) {
          setMensSquad(apiData.MENS || [])
          setWomensSquad(apiData.WOMENS || [])
          setKidsSquad(apiData.KIDS || [])
        } else {
          const [mensResponse, womensResponse, kidsResponse] = await Promise.all([
            fetch('/files/SQUAD/MENS.json'),
            fetch('/files/SQUAD/WOMENS.json'),
            fetch('/files/SQUAD/KIDS.json')
          ])

          if (!mensResponse.ok || !womensResponse.ok || !kidsResponse.ok) {
            throw new Error('Failed to fetch squad data')
          }

          const [mensData, womensData, kidsData] = await Promise.all([
            mensResponse.json(), womensResponse.json(), kidsResponse.json()
          ])

          setMensSquad(mensData)
          setWomensSquad(womensData)
          setKidsSquad(kidsData)
        }
        setExpandedTeams({})
      } catch (err) {
        setError('Failed to load squad data. Please try again later.')
        console.error('Error fetching squads:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSquads()
  }, [])

  // Reset expanded teams when switching tabs
  useEffect(() => {
    setExpandedTeams({})
    // Cancel any ongoing edits when switching tabs
    setEditingMember(null)
    // Reset add player state
    setAddingPlayerTeam(null)
    setNewPlayer({
      'Player Name': '',
      'Mobile Number': '',
      Age: '',
      'Jersey Name': '',
      'Jersey Number': '',
      'Jersey Size': '',
      'Cric Heroes Link': ''
    })
  }, [activeTab])

  // Group squad members by team
  const groupSquadByTeam = (squad: SquadMember[]) => {
    const grouped: {[key: string]: SquadMember[]} = {}
    squad.forEach(member => {
      const teamName = member['Team Name'] || 'Unassigned'
      if (!grouped[teamName]) {
        grouped[teamName] = []
      }
      grouped[teamName].push(member)
    })
    return grouped
  }

  // Toggle team expansion - collapse all others when expanding one
  const toggleTeam = (teamName: string) => {
    setExpandedTeams(prev => {
      const isCurrentlyExpanded = prev[teamName]
      if (isCurrentlyExpanded) {
        return {}
      } else {
        setTimeout(() => {
          const teamElement = document.getElementById(`team-${teamName.replace(/\s+/g, '-')}`)
          if (teamElement) {
            const headerOffset = 100
            const elementPosition = teamElement.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
          }
        }, 100)
        return { [teamName]: true }
      }
    })
  }

  const getCurrentSquad = () => {
    switch (activeTab) {
      case 'MENS': return mensSquad
      case 'WOMENS': return womensSquad
      case 'KIDS': return kidsSquad
      default: return []
    }
  }

  // Handle edit button click
  const handleEditClick = (member: SquadMember) => {
    if (isAdminAuthenticated) {
      startEditing(member)
    } else {
      setPendingEditMember(member)
      setShowAdminAuth(true)
    }
  }

  // Start inline editing
  const startEditing = (member: SquadMember) => {
    const memberKey = getMemberKey(member)
    setEditingMember(memberKey)
    setEditValues({
      'Jersey Name': member['Jersey Name'] || '',
      'Jersey Number': member['Jersey Number']?.toString() || '',
      'Jersey Size': member['Jersey Size'] || ''
    })
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingMember(null)
    setEditValues({
      'Jersey Name': '',
      'Jersey Number': '',
      'Jersey Size': ''
    })
  }

  // Handle admin authentication success
  const handleAdminAuthenticated = () => {
    setIsAdminAuthenticated(true)
    setShowAdminAuth(false)
    
    if (pendingEditMember) {
      startEditing(pendingEditMember)
      setPendingEditMember(null)
    }
  }

  // Handle admin authentication modal close
  const handleAdminAuthClose = () => {
    setShowAdminAuth(false)
    setPendingEditMember(null)
  }

  // Handle input changes (edit existing member)
  const handleInputChange = (field: 'Jersey Name' | 'Jersey Number' | 'Jersey Size', value: string) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Save changes
  const handleSave = async (member: SquadMember) => {
    const memberKey = getMemberKey(member)
    
    // Validation
    if (!editValues['Jersey Name'].trim()) {
      alert('Jersey Name is required')
      return
    }
    if (!editValues['Jersey Number']) {
      alert('Jersey Number is required')
      return
    }
    if (!editValues['Jersey Size']) {
      alert('Jersey Size is required')
      return
    }

    setSavingMember(memberKey)

    try {
      const updatedMember: SquadMember = {
        ...member,
        'Jersey Name': editValues['Jersey Name'].trim(),
        'Jersey Number': editValues['Jersey Number'],
        'Jersey Size': editValues['Jersey Size']
      }

      const response = await fetch('/api/update-squad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: activeTab,
          originalMember: member,
          updatedMember: updatedMember
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Update the local state
        const updateSquadData = (squad: SquadMember[]) => {
          return squad.map(m => {
            if (getMemberKey(m) === memberKey) {
              return result.updatedMember
            }
            return m
          })
        }

        switch (activeTab) {
          case 'MENS':
            setMensSquad(updateSquadData)
            break
          case 'WOMENS':
            setWomensSquad(updateSquadData)
            break
          case 'KIDS':
            setKidsSquad(updateSquadData)
            break
        }

        // Exit edit mode
        cancelEditing()
      } else {
        alert('Failed to update squad member: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating squad member:', error)
      alert('Error updating squad member. Please try again.')
    } finally {
      setSavingMember(null)
    }
  }

  // Handle new player input change
  const handleNewPlayerChange = (field: keyof typeof newPlayer, value: string) => {
    setNewPlayer(prev => ({ ...prev, [field]: value }))
  }

  // Start adding player
  const startAddingPlayer = (teamName: string) => {
    if (!isAdminAuthenticated) {
      setShowAdminAuth(true)
      return
    }
    setAddingPlayerTeam(teamName)
    setNewPlayer({
      'Player Name': '',
      'Mobile Number': '',
      Age: '',
      'Jersey Name': '',
      'Jersey Number': '',
      'Jersey Size': '',
      'Cric Heroes Link': ''
    })
    setAddError(null)
  }

  // Cancel adding player
  const cancelAddingPlayer = () => {
    setAddingPlayerTeam(null)
    setAddError(null)
  }

  // Validate and add player
  const handleAddPlayer = async (teamName: string) => {
    // Required fields
    if (!newPlayer['Player Name'].trim()) { setAddError('Player Name is required'); return }
    if (!newPlayer['Mobile Number'].trim()) { setAddError('Mobile Number is required'); return }
    if (activeTab === 'KIDS' && !newPlayer.Age?.trim()) { setAddError('Age is required for KIDS category'); return }

    setAdding(true)
    setAddError(null)

    const payload: SquadMember = {
      'Player Name': newPlayer['Player Name'].trim(),
      'Mobile Number': newPlayer['Mobile Number'].trim(),
      'Team Name': teamName,
      'Jersey Name': newPlayer['Jersey Name'].trim() || undefined,
      'Jersey Number': newPlayer['Jersey Number'].trim() || undefined,
      'Jersey Size': newPlayer['Jersey Size'].trim() || undefined,
      'Cric Heroes Link': newPlayer['Cric Heroes Link'].trim() || undefined,
      Age: activeTab === 'KIDS' ? Number(newPlayer.Age) || undefined : undefined
    }

    try {
      const res = await fetch('/api/add-squad-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: activeTab, newMember: payload })
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        setAddError(result.error || 'Failed to add player')
      } else {
        // Update local state
        switch (activeTab) {
          case 'MENS':
            setMensSquad(prev => [...prev, result.newMember])
            break
          case 'WOMENS':
            setWomensSquad(prev => [...prev, result.newMember])
            break
          case 'KIDS':
            setKidsSquad(prev => [...prev, result.newMember])
            break
        }
        cancelAddingPlayer()
      }
    } catch (e) {
      console.error(e)
      setAddError('Error adding player. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  // Get team color based on index
  const getTeamColor = (index: number) => {
    return teamColors[index % teamColors.length]
  }

  // Copy team function with new format (no emojis, Player Name - Mobile Number format)
  const copyTeam = async (teamName: string, members: SquadMember[]) => {
    const teamText = `${teamName} - SPL-02 Squad\n\n` +
      members.map((member, index) => 
        `${index + 1}. ${member['Player Name']} - ${member['Mobile Number']}`
      ).join('\n') +
      `\n\nTotal Players: ${members.length}\n\n#SPL02 #SparshPremierLeague #Cricket`

    copyToClipboard(teamText, teamName)
  }

  // Copy to clipboard function with Android optimizations
  const copyToClipboard = async (text: string, teamName: string) => {
    console.log('Starting clipboard copy for:', teamName)
    
    try {
      // Modern clipboard API (preferred method)
      if (navigator.clipboard && window.isSecureContext) {
        console.log('Using modern clipboard API')
        await navigator.clipboard.writeText(text)
        setCopiedTeam(teamName)
        setTimeout(() => setCopiedTeam(null), 3000)
        console.log('Modern clipboard copy successful')
        return
      }
    } catch (err) {
      console.warn('Modern clipboard failed:', err)
    }

    // Android-specific clipboard handling
    const isAndroid = navigator.userAgent.toLowerCase().includes('android')
    
    try {
      // Enhanced fallback method for Android
      const textArea = document.createElement('textarea')
      textArea.value = text
      
      // Android-specific styling to ensure visibility
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      textArea.style.top = '-9999px'
      textArea.style.width = '1px'
      textArea.style.height = '1px'
      textArea.style.opacity = '0'
      textArea.style.pointerEvents = 'none'
      textArea.setAttribute('readonly', '')
      textArea.setAttribute('contenteditable', 'true')
      
      document.body.appendChild(textArea)
      
      // Android requires focus before selection
      textArea.focus()
      textArea.select()
      textArea.setSelectionRange(0, text.length)
      
      // Multiple attempts for Android compatibility
      let successful = false
      
      // Try modern execCommand
      if (document.execCommand) {
        successful = document.execCommand('copy')
        console.log('execCommand result:', successful)
      }
      
      // Alternative for some Android versions
      if (!successful && isAndroid) {
        try {
          // Try triggering Android's native copy
          const selection = window.getSelection()
          if (selection) {
            selection.removeAllRanges()
            const range = document.createRange()
            range.selectNodeContents(textArea)
            selection.addRange(range)
            successful = document.execCommand('copy')
            selection.removeAllRanges()
          }
        } catch (selectionError) {
          console.log('Selection method failed:', selectionError)
        }
      }
      
      document.body.removeChild(textArea)
      
      if (successful) {
        setCopiedTeam(teamName)
        setTimeout(() => setCopiedTeam(null), 3000)
        console.log('Fallback clipboard copy successful')
      } else {
        throw new Error('All copy methods failed')
      }
    } catch (err) {
      console.error('All clipboard methods failed:', err)
      
      // Final fallback - show the text for manual copy
      if (isAndroid) {
        // Android-specific fallback with better UX
        const modal = document.createElement('div')
        modal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 20px;
          z-index: 99999;
          overflow: auto;
          font-family: monospace;
          font-size: 14px;
          line-height: 1.4;
        `
        
        modal.innerHTML = `
          <div style="max-width: 600px; margin: 0 auto;">
            <h3 style="margin-bottom: 20px;">Copy Team Data</h3>
            <p style="margin-bottom: 15px;">Long press the text below and select "Copy":</p>
            <textarea readonly style="width: 100%; height: 300px; background: #333; color: white; border: 1px solid #666; padding: 10px; font-family: inherit;">${text}</textarea>
            <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px;">Close</button>
          </div>
        `
        
        document.body.appendChild(modal)
        
        // Auto-select the textarea content
        setTimeout(() => {
          const textarea = modal.querySelector('textarea')
          if (textarea) {
            (textarea as HTMLTextAreaElement).focus()
            ;(textarea as HTMLTextAreaElement).select()
          }
        }, 100)
      } else {
        // Standard alert for other platforms
        alert(`Copy failed. Please manually select and copy:\n\n${text.substring(0, 200)}...`)
      }
    }
  }

  // Export team to TXT format (Android app optimized)
  const exportTeamToTXT = (teamName: string, members: SquadMember[]) => {
    const txtContent = `${teamName} - SPL-02 Squad\n` +
      `${'='.repeat(50)}\n\n` +
      members.map((member, index) => {
        let memberInfo = `${index + 1}. ${member['Player Name']}\n`
        memberInfo += `   Mobile: ${member['Mobile Number']}\n`
        if (member['Jersey Name']) memberInfo += `   Jersey Name: ${member['Jersey Name']}\n`
        if (member['Jersey Number']) memberInfo += `   Jersey Number: ${member['Jersey Number']}\n`
        if (member['Jersey Size']) memberInfo += `   Jersey Size: ${member['Jersey Size']}\n`
        if (member.Age) memberInfo += `   Age: ${member.Age} years\n`
        if (member['Cric Heroes Link']) memberInfo += `   CricHeroes: ${member['Cric Heroes Link']}\n`
        return memberInfo + '\n'
      }).join('') +
      `Total Players: ${members.length}\n\n` +
      `Generated from SPL-02 Team Management System\n` +
      `#SPL02 #SparshPremierLeague #Cricket`

    const fileName = `${teamName.replace(/[^a-z0-9]/gi, '_')}_Squad_SPL02.txt`

    // Enhanced Android/Mobile detection
    const userAgent = navigator.userAgent.toLowerCase()
    const isAndroid = userAgent.includes('android')
    const isWebView = userAgent.includes('wv') || userAgent.includes('webview')
    const isMobileApp = /mobile|android|ios|iphone|ipad/.test(userAgent) || 
                       isWebView || 
                       !window.document.createElement('a').download ||
                       (window as any).ReactNativeWebView !== undefined || // React Native
                       (window as any).flutter_inappwebview !== undefined || // Flutter
                       (window as any).webkit?.messageHandlers !== undefined // iOS WebView

    console.log('Export Debug:', { isAndroid, isWebView, isMobileApp, userAgent })

    // Android/Mobile App specific handling
    if (isMobileApp || isAndroid) {
      console.log('Using mobile export strategy')
      
      // Try Web Share API (modern Android)
      if (navigator.share) {
        console.log('Attempting Web Share API')
        try {
          // Try sharing as file first (if supported)
          if (navigator.canShare && navigator.canShare({ files: [new File([txtContent], fileName, { type: 'text/plain' })] })) {
            const file = new File([txtContent], fileName, { type: 'text/plain' })
            navigator.share({
              files: [file],
              title: `${teamName} Squad - SPL-02`,
              text: 'Team squad information from SPL-02'
            }).then(() => {
              console.log('File share successful')
            }).catch((error) => {
              console.log('File share failed, trying text share:', error)
              // Fallback to text sharing
              navigator.share({
                title: `${teamName} Squad - SPL-02`,
                text: txtContent
              }).catch((error) => {
                console.log('Text share failed, using clipboard:', error)
                copyToClipboard(txtContent, teamName + ' (TXT)')
                alert('Team data copied to clipboard. You can paste it in any app.')
              })
            })
            return
          } else {
            // Share as text if file sharing not supported
            navigator.share({
              title: `${teamName} Squad - SPL-02`,
              text: txtContent
            }).then(() => {
              console.log('Text share successful')
            }).catch((error) => {
              console.log('Text share failed:', error)
              copyToClipboard(txtContent, teamName + ' (TXT)')
              alert('Team data copied to clipboard. You can paste it in any app.')
            })
            return
          }
        } catch (error) {
          console.log('Web Share API error:', error)
        }
      }

      // 2. Try Android Intent (if available)
      if (isAndroid && (window as any).Android) {
        console.log('Trying Android interface')
        try {
          (window as any).Android.saveFile(fileName, txtContent)
          return
        } catch (error) {
          console.log('Android interface failed:', error)
        }
      }

      // 3. Clipboard fallback with user guidance
      console.log('Using clipboard fallback for mobile')
      copyToClipboard(txtContent, teamName + ' (TXT)')
      
      // Show mobile-specific instructions
      const instructions = isAndroid 
        ? 'Team data copied to clipboard!\n\nYou can now:\n• Open any text editor or notes app\n• Long press and select "Paste"\n• Save the file\n\nOr share directly from clipboard in WhatsApp, Email, etc.'
        : 'Team data copied to clipboard!\n\nYou can paste it in:\n• Notes app\n• Text editor\n• WhatsApp\n• Email\n• Any messaging app'
      
      alert(instructions)
      return
    }

    // Desktop browser handling (original logic)
    console.log('Using desktop export strategy')
    try {
      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (window.URL && window.URL.createObjectURL) {
        const url = window.URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', fileName)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up the URL object
        setTimeout(() => {
          try {
            window.URL.revokeObjectURL(url)
          } catch (e) {
            console.log('URL cleanup failed:', e)
          }
        }, 100)
      } else {
        // Fallback for browsers without createObjectURL
        const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txtContent)
        link.setAttribute('href', dataUrl)
        link.setAttribute('download', fileName)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Desktop export failed:', error)
      // Final fallback: copy to clipboard
      copyToClipboard(txtContent, teamName + ' (TXT)')
      alert('Direct download failed. Team data copied to clipboard instead.')
    }
  }

  // Export team to Excel format (XLSX) - Direct download optimized
  const exportTeamToExcel = (teamName: string, members: SquadMember[]) => {
    // Create CSV content that can be imported to Excel
    const headers = ['Player Name', 'Mobile Number', 'Jersey Name', 'Jersey Number', 'Jersey Size', 'Jersey Color', 'CricHeroes Link']
    if (members.some(m => m.Age)) headers.splice(2, 0, 'Age')

    const csvContent = [
      headers.join(','),
      ...members.map(member => {
        const row = [
          `"${member['Player Name']}"`,
          `"${member['Mobile Number']}"`,
          ...(members.some(m => m.Age) ? [`"${member.Age || ''}"`] : []),
          `"${member['Jersey Name'] || ''}"`,
            `"${member['Jersey Number'] || ''}"`,
          `"${member['Jersey Size'] || ''}"`,
          `"${member['JERSEY COLOR'] || ''}"`,
          `"${member['Cric Heroes Link'] || ''}"`
        ]
        return row.join(',')
      })
    ].join('\n')

    const fileName = `${teamName.replace(/[^a-z0-9]/gi, '_')}_Squad_SPL02.csv`

    // Desktop-first approach for direct download
    try {
      // Add BOM for proper Excel UTF-8 handling
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      })
      const link = document.createElement('a')
      
      if (window.URL && window.URL.createObjectURL) {
        const url = window.URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', fileName)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up the URL object
        setTimeout(() => {
          try {
            window.URL.revokeObjectURL(url)
          } catch (e) {
            console.log('URL cleanup failed:', e)
          }
        }, 100)
      } else {
        // Fallback for browsers without createObjectURL
        const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(BOM + csvContent)
        link.setAttribute('href', dataUrl)
        link.setAttribute('download', fileName)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Direct Excel download failed:', error)
      // Fallback: copy to clipboard
      copyToClipboard(csvContent, teamName + ' (Excel Data)')
      alert('Direct download failed. Excel data copied to clipboard instead. You can paste it into Excel or any spreadsheet app.')
    }
  }

  // Export all category data to Excel - Direct download optimized
  const exportCategoryToExcel = (category: 'MENS' | 'WOMENS' | 'KIDS') => {
    let squadData: SquadMember[] = []
    
    switch (category) {
      case 'MENS':
        squadData = mensSquad
        break
      case 'WOMENS':
        squadData = womensSquad
        break
      case 'KIDS':
        squadData = kidsSquad
        break
    }

    if (squadData.length === 0) {
      alert(`No ${category} squad data available to export.`)
      return
    }

    // Create comprehensive CSV content
    const headers = ['Team Name', 'Jersey Color', 'Player Name', 'Mobile Number', 'Jersey Name', 'Jersey Number', 'Jersey Size', 'CricHeroes Link']
    if (squadData.some(m => m.Age)) headers.splice(4, 0, 'Age')

    const csvContent = [
      headers.join(','),
      ...squadData.map(member => {
        const row = [
          `"${member['Team Name'] || ''}"`,
          `"${member['JERSEY COLOR'] || ''}"`,
          `"${member['Player Name']}"`,
          `"${member['Mobile Number']}"`,
          ...(squadData.some(m => m.Age) ? [`"${member.Age || ''}"`] : []),
          `"${member['Jersey Name'] || ''}"`,
          `"${member['Jersey Number'] || ''}"`,
          `"${member['Jersey Size'] || ''}"`,
          `"${member['Cric Heroes Link'] || ''}"`
        ]
        return row.join(',')
      })
    ].join('\n')

    const fileName = `SPL02_${category}_Complete_Squad.csv`

    // Desktop-first approach for direct download
    try {
      // Add BOM for proper Excel UTF-8 handling
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      })
      const link = document.createElement('a')
      
      if (window.URL && window.URL.createObjectURL) {
        const url = window.URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', fileName)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up the URL object
        setTimeout(() => {
          try {
            window.URL.revokeObjectURL(url)
          } catch (e) {
            console.log('URL cleanup failed:', e)
          }
        }, 100)
      } else {
        // Fallback for browsers without createObjectURL
        const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(BOM + csvContent)
        link.setAttribute('href', dataUrl)
        link.setAttribute('download', fileName)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Direct category Excel download failed:', error)
      // Fallback: copy to clipboard
      copyToClipboard(csvContent, `${category} Complete Squad (Excel Data)`)
      alert(`Direct download failed. ${category} squad Excel data copied to clipboard instead.`)
    }
  }

  // Squad table component with inline edit functionality
  const SquadTable = ({ members }: { members: SquadMember[] }) => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Player Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mobile Number</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jersey Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jersey Number</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jersey Size</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CricHeroes</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {members.map((member) => {
              const memberKey = getMemberKey(member)
              const isEditing = editingMember === memberKey
              const isSaving = savingMember === memberKey

              return (
                <tr key={memberKey} className={`transition-colors ${isEditing ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{member['Player Name']}</div>
                    {member.Age && <div className="text-xs text-gray-500 dark:text-gray-400">Age: {member.Age} years</div>}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <a href={`tel:${member['Mobile Number']}`} className="text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 transition-colors flex items-center space-x-1">
                      <Phone size={14} className="text-gray-500 dark:text-gray-400" />
                      <span>{member['Mobile Number']}</span>
                    </a>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editValues['Jersey Name']}
                        onChange={(e) => handleInputChange('Jersey Name', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Jersey Name"
                        maxLength={20}
                        disabled={isSaving}
                      />
                    ) : (
                      member['Jersey Name'] || '-'
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {isEditing ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={editValues['Jersey Number']}
                        onChange={(e) => handleInputChange('Jersey Number', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Number"
                        disabled={isSaving}
                      />
                    ) : (
                      member['Jersey Number'] || '-'
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {isEditing ? (
                      <select
                        value={editValues['Jersey Size']}
                        onChange={(e) => handleInputChange('Jersey Size', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSaving}
                      >
                        <option value="">Select Size</option>
                        {jerseySizeOptions.map(size => <option key={size} value={size}>{size}</option>)}
                      </select>
                    ) : (
                      member['Jersey Size'] || '-'
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {member['Cric Heroes Link'] ? (
                      <a
                        href={member['Cric Heroes Link']}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded-md transition-colors text-xs"
                      >
                        <span>View Profile</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {isEditing ? (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleSave(member)}
                          disabled={isSaving}
                          className="inline-flex items-center space-x-1 bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded-md transition-colors text-xs font-medium disabled:opacity-50"
                          title="Save changes"
                        >
                          {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                          <span>{isSaving ? 'Saving...' : 'Save'}</span>
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={isSaving}
                          className="inline-flex items-center space-x-1 bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded-md transition-colors text-xs font-medium disabled:opacity-50"
                          title="Cancel editing"
                        >
                          <X size={12} />
                          <span>Cancel</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditClick(member)}
                        className="inline-flex items-center space-x-1 bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded-md transition-colors text-xs font-medium"
                        title="Edit jersey details"
                      >
                        <Edit3 size={12} />
                        <span>Edit</span>
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading squad data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-red-500 mb-4">
            <Trophy size={48} className="mx-auto" />
          </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Squad</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Try Again</button>
        </div>
      </div>
    )
  }

  const currentSquad = getCurrentSquad()
  const groupedSquad = groupSquadByTeam(currentSquad)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-yellow-600 mb-3 sm:mb-4 px-2">SPL-02 Team Squads</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4 leading-relaxed">Explore the complete team squads for Sparsh Premier League Season 2. Click Edit to update jersey details inline (admin access required). Use Add Player to append new players to a team.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto px-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">11</div>
              <div className="text-xs sm:text-sm md:text-base opacity-90 font-medium">MENS Teams</div>
              <div className="text-sm sm:text-lg md:text-xl font-bold">88 Players</div>
            </div>
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">4</div>
              <div className="text-xs sm:text-sm md:text-base opacity-90 font-medium">WOMENS Teams</div>
              <div className="text-sm sm:text-lg md:text-xl font-bold">36 Players</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">4</div>
              <div className="text-xs sm:text-sm md:text-base opacity-90 font-medium">KIDS Teams</div>
              <div className="text-sm sm:text-lg md:text-xl font-bold">28 Players</div>
            </div>
          </div>
        </div>
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            <Link 
              href="/spl02" 
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors shadow-md text-sm sm:text-base font-medium flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Back to SPL-02</span>
            </Link>
          </div>
        </div>
        <div className="text-center mb-4 sm:mb-6 px-4">
          <p className="text-sm sm:text-base md:text-lg text-gray-600 font-medium">Click on any tournament category below to check out team squads</p>
        </div>
        <div className="flex justify-center mb-6 sm:mb-8 px-2">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-xl border border-gray-200 w-full max-w-md sm:max-w-none">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {(['MENS', 'WOMENS', 'KIDS'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 relative overflow-hidden flex-1 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:shadow-md'
                  }`}
                >
                  <span className="relative z-10">{tab}</span>
                  {activeTab === tab && <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6 md:space-y-8 px-2 sm:px-0">
          {Object.entries(groupedSquad).map(([teamName, members], index) => {
            const isExpanded = expandedTeams[teamName]
            const teamColor = getTeamColor(index)
            const getTextColor = (gradientColor: string) => {
              if (gradientColor.includes('purple')) return 'text-purple-700'
              if (gradientColor.includes('yellow')) return 'text-yellow-700'
              if (gradientColor.includes('red')) return 'text-red-700'
              if (gradientColor.includes('gray')) return 'text-gray-700'
              if (gradientColor.includes('green')) return 'text-green-700'
              if (gradientColor.includes('orange')) return 'text-orange-700'
              if (gradientColor.includes('pink')) return 'text-pink-700'
              if (gradientColor.includes('indigo')) return 'text-indigo-700'
              if (gradientColor.includes('teal')) return 'text-teal-700'
              if (gradientColor.includes('cyan')) return 'text-cyan-700'
              return 'text-blue-700'
            }
            const getBackgroundColor = (gradientColor: string) => {
              if (gradientColor.includes('purple')) return 'bg-purple-50/80'
              if (gradientColor.includes('yellow')) return 'bg-yellow-50/80'
              if (gradientColor.includes('red')) return 'bg-red-50/80'
              if (gradientColor.includes('gray')) return 'bg-gray-50/80'
              if (gradientColor.includes('green')) return 'bg-green-50/80'
              if (gradientColor.includes('orange')) return 'bg-orange-50/80'
              if (gradientColor.includes('pink')) return 'bg-pink-50/80'
              if (gradientColor.includes('indigo')) return 'bg-indigo-50/80'
              if (gradientColor.includes('teal')) return 'bg-teal-50/80'
              if (gradientColor.includes('cyan')) return 'bg-cyan-50/80'
              return 'bg-blue-50/80'
            }
            const getHoverColor = (gradientColor: string) => {
              if (gradientColor.includes('purple')) return 'hover:bg-purple-100/60'
              if (gradientColor.includes('yellow')) return 'hover:bg-yellow-100/60'
              if (gradientColor.includes('red')) return 'hover:bg-red-100/60'
              if (gradientColor.includes('gray')) return 'hover:bg-gray-100/60'
              if (gradientColor.includes('green')) return 'hover:bg-green-100/60'
              if (gradientColor.includes('orange')) return 'hover:bg-orange-100/60'
              if (gradientColor.includes('pink')) return 'hover:bg-pink-100/60'
              if (gradientColor.includes('indigo')) return 'hover:bg-indigo-100/60'
              if (gradientColor.includes('teal')) return 'hover:bg-teal-100/60'
              if (gradientColor.includes('cyan')) return 'hover:bg-cyan-100/60'
              return 'hover:bg-blue-100/60'
            }
            const getBorderColor = (gradientColor: string) => {
              if (gradientColor.includes('purple')) return 'border-l-purple-500'
              if (gradientColor.includes('yellow')) return 'border-l-yellow-500'
              if (gradientColor.includes('red')) return 'border-l-red-500'
              if (gradientColor.includes('gray')) return 'border-l-gray-500'
              if (gradientColor.includes('green')) return 'border-l-green-500'
              if (gradientColor.includes('orange')) return 'border-l-orange-500'
              if (gradientColor.includes('pink')) return 'border-l-pink-500'
              if (gradientColor.includes('indigo')) return 'border-l-indigo-500'
              if (gradientColor.includes('teal')) return 'border-l-teal-500'
              if (gradientColor.includes('cyan')) return 'border-l-cyan-500'
              return 'border-l-blue-500'
            }
            
            const textColor = getTextColor(teamColor)
            const backgroundColor = getBackgroundColor(teamColor)
            const hoverColor = getHoverColor(teamColor)
            const borderColor = getBorderColor(teamColor)
            
            return (
              <div key={teamName} id={`team-${teamName.replace(/\s+/g, '-')}`} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className={`w-full ${backgroundColor} backdrop-blur-sm ${textColor} ${hoverColor} p-4 sm:p-5 md:p-6 flex items-center justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group border-l-4 ${borderColor}`}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${teamColor} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                  
                  {/* Team Info - Clickable Area */}
                  <button
                    onClick={() => toggleTeam(teamName)}
                    className="flex items-center space-x-3 sm:space-x-4 relative z-10 flex-1 text-left active:scale-95 transition-transform duration-200"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${teamColor} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Users size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="text-left">
                      <h2 className={`text-lg sm:text-xl md:text-2xl font-bold leading-tight ${textColor}`}>
                        {teamName}
                        {members[0]?.['JERSEY COLOR'] && (
                          <span className="text-sm font-normal opacity-80 ml-2">
                            ({members[0]['JERSEY COLOR']})
                          </span>
                        )}
                      </h2>
                      <p className={`${textColor} opacity-70 text-xs sm:text-sm`}>{members.length} players</p>
                    </div>
                  </button>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 sm:space-x-3 relative z-10">
                    {/* Copy Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyTeam(teamName, members)
                      }}
                      className={`p-2 rounded-lg ${textColor} hover:bg-white/20 transition-all duration-300 hover:scale-110 flex items-center space-x-1 text-xs sm:text-sm font-medium`}
                      title="Copy team list"
                    >
                      {copiedTeam === teamName ? <Check size={16} /> : <Copy size={16} />}
                      <span className="hidden sm:inline">
                        {copiedTeam === teamName ? 'Copied!' : 'Copy'}
                      </span>
                    </button>

                    {/* Excel Export Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setExportingTeam(teamName)
                        exportTeamToExcel(teamName, members)
                        setTimeout(() => setExportingTeam(null), 2000)
                      }}
                      className={`p-2 rounded-lg ${textColor} hover:bg-white/20 transition-all duration-300 hover:scale-110 flex items-center space-x-1 text-xs sm:text-sm font-medium`}
                      title="Export as Excel file"
                    >
                      {exportingTeam === teamName ? <Check size={16} /> : <FileSpreadsheet size={16} />}
                      <span className="hidden sm:inline">
                        {exportingTeam === teamName ? 'Exported!' : 'Excel'}
                      </span>
                    </button>

                    {/* TXT Export Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setExportingTeam(teamName + '_TXT')
                        exportTeamToTXT(teamName, members)
                        setTimeout(() => setExportingTeam(null), 2000)
                      }}
                      className={`p-2 rounded-lg ${textColor} hover:bg-white/20 transition-all duration-300 hover:scale-110 flex items-center space-x-1 text-xs sm:text-sm font-medium`}
                      title="Export as TXT file"
                    >
                      {exportingTeam === teamName + '_TXT' ? <Check size={16} /> : <Download size={16} />}
                      <span className="hidden sm:inline">
                        {exportingTeam === teamName + '_TXT' ? 'Exported!' : 'TXT'}
                      </span>
                    </button>
                  
                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => toggleTeam(teamName)}
                      className={`p-1 rounded-full ${textColor} hover:bg-white/20 transition-colors duration-300`}
                    >
                      {isExpanded ? <ChevronUp size={20} className="sm:w-6 sm:h-6" /> : <ChevronDown size={20} className="sm:w-6 sm:h-6" />}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="p-3 sm:p-4 md:p-6 space-y-6">
                    {/* Add Player Form */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      {addingPlayerTeam === teamName ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-700 flex items-center"><Plus className="w-4 h-4 mr-1" /> Add New Player</h3>
                            <button onClick={cancelAddingPlayer} className="text-xs text-red-600 hover:underline" disabled={adding}>Cancel</button>
                          </div>
                          {addError && (
                            <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {addError}</div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Player Name *</label>
                              <input value={newPlayer['Player Name']} onChange={e => handleNewPlayerChange('Player Name', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" maxLength={50} disabled={adding} />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Mobile Number *</label>
                              <input value={newPlayer['Mobile Number']} onChange={e => handleNewPlayerChange('Mobile Number', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" maxLength={15} disabled={adding} />
                            </div>
                            {activeTab === 'KIDS' && (
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Age *</label>
                                <input value={newPlayer.Age} onChange={e => handleNewPlayerChange('Age', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" maxLength={3} disabled={adding} />
                              </div>
                            )}
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Jersey Name</label>
                              <input value={newPlayer['Jersey Name']} onChange={e => handleNewPlayerChange('Jersey Name', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" maxLength={20} disabled={adding} />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Jersey Number</label>
                              <input value={newPlayer['Jersey Number']} onChange={e => handleNewPlayerChange('Jersey Number', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" maxLength={3} disabled={adding} />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Jersey Size</label>
                              <select value={newPlayer['Jersey Size']} onChange={e => handleNewPlayerChange('Jersey Size', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" disabled={adding}>
                                <option value="">Select Size</option>
                                {jerseySizeOptions.map(size => <option key={size} value={size}>{size}</option>)}
                              </select>
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-xs font-medium text-gray-500 mb-1">CricHeroes Link</label>
                              <input value={newPlayer['Cric Heroes Link']} onChange={e => handleNewPlayerChange('Cric Heroes Link', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" disabled={adding} />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => handleAddPlayer(teamName)} disabled={adding} className="px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center">
                              {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                              {adding ? 'Adding...' : 'Add Player'}
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-500">* Required fields. Jersey details optional until available.</p>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-600">Add new player to this team (admin only)</p>
                          <button onClick={() => startAddingPlayer(teamName)} className="inline-flex items-center space-x-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-medium"><Plus className="w-3 h-3" /><span>Add Player</span></button>
                        </div>
                      )}
                    </div>
                    <SquadTable members={members} />
                  </div>
                )}
              </div>
            )
          })}

          {/* Floating Action Button for Add Player - Desktop */}
          {isAdminAuthenticated && activeTab !== 'KIDS' && (
            <div className="hidden sm:block fixed bottom-8 right-8">
              <button
                onClick={() => startAddingPlayer('')}
                className="bg-blue-600 text-white p-3 rounded-full shadow-md hover:bg-blue-700 transition-colors"
                title="Add New Player (Admin)"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Admin Category Export Section - Moved to bottom */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 max-w-2xl mx-auto">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Admin Export Tools</h4>
            <p className="text-xs text-gray-500 mb-4">Direct download complete category data in Excel format</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <button
                onClick={() => exportCategoryToExcel('MENS')}
                className="group inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
              >
                <FileSpreadsheet size={14} />
                <span>MENS Excel</span>
              </button>
              <button
                onClick={() => exportCategoryToExcel('WOMENS')}
                className="group inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 bg-pink-600 text-white hover:bg-pink-700 shadow-sm hover:shadow-md"
              >
                <FileSpreadsheet size={14} />
                <span>WOMENS Excel</span>
              </button>
              <button
                onClick={() => exportCategoryToExcel('KIDS')}
                className="group inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md"
              >
                <FileSpreadsheet size={14} />
                <span>KIDS Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Admin Auth Modal */}
        <AdminAuthModal
          isOpen={showAdminAuth}
          onClose={handleAdminAuthClose}
          onAuthenticated={handleAdminAuthenticated}
          title="Admin Authentication Required"
          message="Please enter admin credentials to edit squad member details."
        />
      </div>
    </div>
  )
}