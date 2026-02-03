'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Upload, 
  Loader2Icon,
  FileIcon,
  X
} from 'lucide-react'
import { useToast } from '../../hooks/use-toast'

interface Document {
  _id: string
  documentType: string
  fileName: string
  fileSize: number
  status: 'pending' | 'verified' | 'rejected'
  createdAt: string
}

export function DocumentUploadPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedDocType, setSelectedDocType] = useState('student_id')
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  const documentTypes = [
    { value: 'student_id', label: '🎓 Student ID' },
    { value: 'enrollment_letter', label: '📜 Enrollment Letter' },
    { value: 'transcript', label: '📊 Transcript' },
    { value: 'business_license', label: '📋 Business License' },
    { value: 'aadhar', label: '🆔 Aadhar Card' },
    { value: 'pan', label: '📝 PAN Card' },
    { value: 'passport', label: '🛂 Passport' },
    { value: 'other', label: '📄 Other Document' },
  ]

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')

      const response = await fetch(`${API_BASE}/verification/my-documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error: any) {
      toast({
        title: '❌ Error loading documents',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      setSelectedFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      setSelectedFile(files[0])
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: '❌ No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      })
      return
    }

    try {
      setUploading(true)
      const token = localStorage.getItem('auth_token')
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('documentType', selectedDocType)

      const response = await fetch(`${API_BASE}/verification/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to upload document')
      }

      const data = await response.json()
      setDocuments([...documents, data.document])
      setSelectedFile(null)
      setSelectedDocType('student_id')

      toast({
        title: '✅ Document uploaded',
        description: 'Your document has been submitted for verification',
      })
    } catch (error: any) {
      toast({
        title: '❌ Upload failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-700 border-green-300">✅ Verified</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-300">❌ Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">⏳ Pending</Badge>
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    const doc = documentTypes.find(d => d.value === type)
    return doc ? doc.label : type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2Icon className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-2xl shadow-md">
              📁
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Document Verification
              </h1>
              <p className="text-gray-600 mt-1">
                Upload documents to verify your identity
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>📋 Why we need this:</strong> Your documents help us verify your identity and ensure account security. Our admin team will review your documents and notify you once they're verified.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Document Type
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                disabled={uploading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select File
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium mb-1">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-gray-600 mb-4">or</p>
                <label htmlFor="file-input" className="inline-block">
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer font-medium">
                    Browse Files
                  </span>
                  <input
                    id="file-input"
                    type="file"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-4">
                  Supported formats: JPG, PNG, PDF, DOC (Max 10MB)
                </p>
              </div>

              {/* Selected File Display */}
              {selectedFile && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{selectedFile.name}</p>
                      <p className="text-sm text-green-700">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1 hover:bg-green-100 rounded"
                  >
                    <X className="w-5 h-5 text-green-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-medium"
            >
              {uploading ? (
                <>
                  <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Uploaded Documents Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">
              Your Documents ({documents.length})
            </h2>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No documents uploaded yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Upload your first document to start the verification process
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <FileIcon className="w-10 h-10 text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">
                          {getDocumentTypeLabel(doc.documentType)}
                        </p>
                        {getStatusBadge(doc.status)}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{doc.fileName}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>📦 {formatFileSize(doc.fileSize)}</span>
                        <span>📅 {new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {documents.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>✅ Status:</strong> Your documents have been submitted for verification. The admin team will review them and notify you of the result. This may take up to 24-48 hours.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
