'use client'

import React, { useState, useEffect } from 'react'
import { Edit3, Save, X, Loader2, AlertCircle } from 'lucide-react'

// Define the squad member interface (matching the one in squad page)
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

interface EditSquadMemberModalProps {
  isOpen: boolean
  onClose: () => void
  member: SquadMember | null
  onSave: (updatedMember: SquadMember) => Promise<boolean>
}

export default function EditSquadMemberModal({ 
  isOpen, 
  onClose, 
  member, 
  onSave 
}: EditSquadMemberModalProps) {
  const [editedMember, setEditedMember] = useState<SquadMember | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Jersey size options
  const jerseySizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']

  // Initialize form when member changes
  useEffect(() => {
    if (member) {
      setEditedMember({ ...member })
    }
    setError('')
  }, [member])

  const handleInputChange = (field: keyof SquadMember, value: string | number) => {
    if (!editedMember) return

    setEditedMember(prev => prev ? {
      ...prev,
      [field]: value
    } : null)
  }

  const handleSave = async () => {
    if (!editedMember) return

    // Validate required fields
    if (!editedMember['Jersey Name']?.trim()) {
      setError('Jersey Name is required')
      return
    }

    if (!editedMember['Jersey Number']) {
      setError('Jersey Number is required')
      return
    }

    if (!editedMember['Jersey Size']) {
      setError('Jersey Size is required')
      return
    }

    setSaving(true)
    setError('')

    try {
      const success = await onSave(editedMember)
      if (success) {
        onClose()
      } else {
        setError('Failed to update squad member. Please try again.')
      }
    } catch (err) {
      setError('An error occurred while saving. Please try again.')
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (saving) return
    setError('')
    onClose()
  }

  if (!isOpen || !member || !editedMember) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Edit3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Edit Squad Member</h3>
              <p className="text-sm text-gray-600">{member['Player Name']}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={saving}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Player Information (Read-only) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Player Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Player Name</label>
                <input
                  type="text"
                  value={editedMember['Player Name']}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={editedMember['Mobile Number']}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Team Name</label>
                <input
                  type="text"
                  value={editedMember['Team Name']}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  disabled
                />
              </div>
              {editedMember.Age && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Age</label>
                  <input
                    type="text"
                    value={`${editedMember.Age} years`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    disabled
                  />
                </div>
              )}
            </div>
          </div>

          {/* Editable Jersey Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Jersey Details (Editable)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Jersey Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jersey Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editedMember['Jersey Name'] || ''}
                  onChange={(e) => handleInputChange('Jersey Name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter jersey name"
                  disabled={saving}
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(editedMember['Jersey Name'] || '').length}/20 characters
                </p>
              </div>

              {/* Jersey Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jersey Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={editedMember['Jersey Number'] || ''}
                  onChange={(e) => handleInputChange('Jersey Number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter jersey number"
                  disabled={saving}
                  min="0"
                  max="999"
                />
              </div>

              {/* Jersey Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jersey Size <span className="text-red-500">*</span>
                </label>
                <select
                  value={editedMember['Jersey Size'] || ''}
                  onChange={(e) => handleInputChange('Jersey Size', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={saving}
                >
                  <option value="">Select jersey size</option>
                  {jerseySizeOptions.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              {/* Jersey Color (if available) */}
              {editedMember['JERSEY COLOR'] && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jersey Color</label>
                  <input
                    type="text"
                    value={editedMember['JERSEY COLOR']}
                    onChange={(e) => handleInputChange('JERSEY COLOR', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter jersey color"
                    disabled={saving}
                  />
                </div>
              )}
            </div>
          </div>

          {/* CricHeroes Link (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CricHeroes Profile Link (Optional)
            </label>
            <input
              type="url"
              value={editedMember['Cric Heroes Link'] || ''}
              onChange={(e) => handleInputChange('Cric Heroes Link', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
              disabled={saving}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              disabled={saving || !editedMember['Jersey Name']?.trim() || !editedMember['Jersey Number'] || !editedMember['Jersey Size']}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 text-center">
            <AlertCircle className="inline w-3 h-3 mr-1" />
            Only jersey details can be modified. Player information cannot be changed.
          </p>
        </div>
      </div>
    </div>
  )
}