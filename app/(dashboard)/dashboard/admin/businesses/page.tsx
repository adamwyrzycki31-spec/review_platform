"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, Search, Plus, AlertCircle, Loader2, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface Business {
  id: string
  name: string
  slug: string
  description: string | null
  website: string | null
  logoUrl: string | null
  city: string | null
  country: string | null
  phone: string | null
  businessEmail: string | null
  trustScore: any
  reviewCount: number
  subscriptionTier: string
  subscriptionStatus: string
  trafficLightStatus: string
  insuranceUrl: string | null
  termsUrl: string | null
  promisePageUrl: string | null
  verifiedAt: Date | null
  createdAt: Date
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  }
  category: {
    id: string
    name: string
  } | null
}

interface Stats {
  total: number
  green: number
  amber: number
  red: number
}

const defaultStats: Stats = {
  total: 0,
  green: 0,
  amber: 0,
  red: 0,
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-500/10 text-green-500 border-green-500/20',
  EXPIRED: 'bg-red-500/10 text-red-500 border-red-500/20',
  PAST_DUE: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  CANCELLED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
}

const trafficLightColors: Record<string, string> = {
  GREEN: 'bg-green-500/10 text-green-500 border-green-500/20',
  AMBER: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  RED: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export default function AdminBusinessesPage() {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [stats, setStats] = useState<Stats>(defaultStats)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [actionType, setActionType] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Edit Business State
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    website: '',
    businessEmail: '',
    city: '',
    country: '',
    phone: '',
  })

  // Add Business State
  const [addForm, setAddForm] = useState({
    name: '',
    description: '',
    website: '',
    businessEmail: '',
    city: '',
    country: '',
    phone: '',
  })

  // Fetch businesses
  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (activeTab !== 'all') params.set('tab', activeTab)

      const response = await fetch(`/api/admin/businesses?${params}`)
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch businesses')
      }
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setBusinesses(data.businesses || [])
      setFilteredBusinesses(data.businesses || [])
      setStats(data.stats || defaultStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load businesses')
      setStats(defaultStats)
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, activeTab, router])

  useEffect(() => {
    fetchBusinesses()
  }, [fetchBusinesses])

  // Filter businesses when search changes
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      setFilteredBusinesses(businesses.filter(business =>
        business.name.toLowerCase().includes(query) ||
        business.slug.toLowerCase().includes(query) ||
        (business.businessEmail?.toLowerCase() || '').includes(query) ||
        (business.city?.toLowerCase() || '').includes(query)
      ))
    } else {
      setFilteredBusinesses(businesses)
    }
  }, [searchQuery, businesses])

  // Handle actions
  const handleAction = async (action: string, business?: Business) => {
    setSelectedBusiness(business || null)
    setActionType(action)
    
    if (action === 'edit' && business) {
      setEditForm({
        name: business.name || '',
        description: business.description || '',
        website: business.website || '',
        businessEmail: business.businessEmail || '',
        city: business.city || '',
        country: business.country || '',
        phone: business.phone || '',
      })
    }
    
    if (action === 'create') {
      setAddForm({
        name: '',
        description: '',
        website: '',
        businessEmail: '',
        city: '',
        country: '',
        phone: '',
      })
    }
    
    if (action === 'delete' && business) {
      if (!confirm(`Are you sure you want to delete ${business.name}? This action cannot be undone.`)) {
        return
      }
    }
    
    setIsDialogOpen(true)
  }

  const executeAction = async () => {
    setIsProcessing(true)
    try {
      let body: any = { action: actionType }

      switch (actionType) {
        case 'create':
          body.data = addForm
          break
        case 'update':
          body.businessId = selectedBusiness?.id
          body.data = editForm
          break
        case 'delete':
        case 'verify':
          body.businessId = selectedBusiness?.id
          break
        case 'update-traffic-light':
          body.businessId = selectedBusiness?.id
          body.data = { trafficLightStatus: selectedBusiness?.trafficLightStatus }
          break
      }

      const response = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Action failed')
      }

      setIsDialogOpen(false)
      setSelectedBusiness(null)
      setActionType('')
      setAddForm({
        name: '',
        description: '',
        website: '',
        businessEmail: '',
        city: '',
        country: '',
        phone: '',
      })
      setEditForm({
        name: '',
        description: '',
        website: '',
        businessEmail: '',
        city: '',
        country: '',
        phone: '',
      })
      
      // Refresh list
      fetchBusinesses()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-app py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Business Management</h1>
              <p className="text-muted-foreground">Manage all platform businesses</p>
            </div>
          </div>
          <Button onClick={() => handleAction('create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Business
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className={stats.green > 0 ? 'border-green-200 bg-green-50/50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">✓</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold text-green-600">{stats.green}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={stats.amber > 0 ? 'border-yellow-200 bg-yellow-50/50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">!</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amber</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.amber}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={stats.red > 0 ? 'border-red-200 bg-red-50/50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">✗</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-red-500">{stats.red}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-6">
            {/* Search */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search businesses by name, slug, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="verified">Verified</TabsTrigger>
                <TabsTrigger value="amber">Amber</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive">{error}</p>
                    <Button variant="outline" onClick={fetchBusinesses} className="mt-4">
                      Retry
                    </Button>
                  </div>
                ) : filteredBusinesses.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No businesses found</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Business</TableHead>
                          <TableHead>Trust Level</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Reviews</TableHead>
                          <TableHead>Verified</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBusinesses.map((business) => (
                          <TableRow key={business.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                                  {business.logoUrl ? (
                                    <img src={business.logoUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-xs font-medium text-primary">
                                      {business.name[0].toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <span className="font-medium">{business.name}</span>
                                  <p className="text-xs text-muted-foreground">
                                    {business.website && (
                                      <a href={business.website} target="_blank" rel="noopener" className="hover:text-primary">
                                        {business.website.replace(/^https?:\/\//, '')}
                                      </a>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={trafficLightColors[business.trafficLightStatus] || 'bg-gray-500/10 text-gray-500'}>
                                {business.trafficLightStatus === 'GREEN' && '● '}
                                {business.trafficLightStatus === 'AMBER' && '● '}
                                {business.trafficLightStatus === 'RED' && '● '}
                                {business.trafficLightStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(business.createdAt)}
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{business.reviewCount}</span>
                            </TableCell>
                            <TableCell>
                              {business.verifiedAt ? (
                                <span className="inline-flex items-center text-green-600 text-sm">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-yellow-600 text-sm">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Pending
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                      <circle cx="12" cy="12" r="2" />
                                      <circle cx="12" cy="5" r="2" />
                                      <circle cx="12" cy="19" r="2" />
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => window.open(`/business/${business.slug}`, '_blank')}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Public Page
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAction('edit', business)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Business
                                  </DropdownMenuItem>
                                  {!business.verifiedAt && (
                                    <DropdownMenuItem onClick={() => handleAction('verify', business)}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Verify Business
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleAction('delete', business)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Business
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'create' && 'Add New Business'}
              {actionType === 'edit' && 'Edit Business'}
              {actionType === 'delete' && 'Delete Business'}
              {actionType === 'verify' && 'Verify Business'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'create' && 'Create a new business profile'}
              {actionType === 'edit' && `Editing ${selectedBusiness?.name}`}
              {actionType === 'delete' && `This will permanently delete ${selectedBusiness?.name}`}
              {actionType === 'verify' && `Verify ${selectedBusiness?.name}`}
            </DialogDescription>
          </DialogHeader>

          {/* Edit Business Form */}
          {actionType === 'edit' && (
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Business Name</Label>
                  <Input
                    id="editName"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editWebsite">Website</Label>
                  <Input
                    id="editWebsite"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editEmail">Business Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editForm.businessEmail}
                    onChange={(e) => setEditForm({ ...editForm, businessEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input
                    id="editPhone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editCity">City</Label>
                  <Input
                    id="editCity"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCountry">Country</Label>
                  <Input
                    id="editCountry"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          {/* Add Business Form */}
          {actionType === 'create' && (
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="addName">Business Name *</Label>
                <Input
                  id="addName"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Enter business name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addWebsite">Website</Label>
                  <Input
                    id="addWebsite"
                    value={addForm.website}
                    onChange={(e) => setAddForm({ ...addForm, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addEmail">Business Email</Label>
                  <Input
                    id="addEmail"
                    type="email"
                    value={addForm.businessEmail}
                    onChange={(e) => setAddForm({ ...addForm, businessEmail: e.target.value })}
                    placeholder="contact@business.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addPhone">Phone</Label>
                  <Input
                    id="addPhone"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addCountry">Country</Label>
                  <Input
                    id="addCountry"
                    value={addForm.country}
                    onChange={(e) => setAddForm({ ...addForm, country: e.target.value })}
                    placeholder="United States"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="addCity">City</Label>
                <Input
                  id="addCity"
                  value={addForm.city}
                  onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                  placeholder="New York"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addDescription">Description</Label>
                <Textarea
                  id="addDescription"
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  placeholder="Describe the business..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          {actionType === 'delete' && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this business? This action cannot be undone.
              </p>
            </div>
          )}

          {/* Verify Business */}
          {actionType === 'verify' && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Mark {selectedBusiness?.name} as verified. This will change their traffic light status to GREEN.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={executeAction} 
              disabled={isProcessing || (actionType === 'create' && !addForm.name)}
              variant={actionType === 'delete' ? 'destructive' : 'default'}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : actionType === 'create' ? 'Create Business' :
                 actionType === 'edit' ? 'Save Changes' :
                 actionType === 'delete' ? 'Delete Business' :
                 'Verify Business'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
