"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Search, Plus, AlertCircle, Loader2 } from 'lucide-react'
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

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  emailVerified: Date | null
  createdAt: Date
  business?: { id: string; name: string } | null
  reseller?: { id: string; commissionBalance: number } | null
}

interface Stats {
  total: number
  admins: number
  businesses: number
  individuals: number
  resellers: number
  support: number
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-500/10 text-red-500 border-red-500/20',
  BUSINESS: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  INDIVIDUAL: 'bg-green-500/10 text-green-500 border-green-500/20',
  RESELLER: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  SUPPORT: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, admins: 0, businesses: 0, individuals: 0, resellers: 0, support: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionType, setActionType] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Edit User State
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', role: '' })

  // Add User State
  const [addUserForm, setAddUserForm] = useState({ email: '', firstName: '', lastName: '', role: 'INDIVIDUAL', password: '' })

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (activeTab !== 'all') params.set('tab', activeTab)

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data.users)
      setFilteredUsers(data.users)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, activeTab, router])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Filter users when search changes
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(users.filter(user =>
        user.email.toLowerCase().includes(query) ||
        (user.firstName?.toLowerCase() || '').includes(query) ||
        (user.lastName?.toLowerCase() || '').includes(query)
      ))
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

  // Handle actions
  const handleAction = async (action: string, user?: User) => {
    setSelectedUser(user || null)
    setActionType(action)
    
    if (action === 'edit' && user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role,
      })
    }
    
    if (action === 'delete' && user) {
      if (!confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) {
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
          body.data = addUserForm
          break
        case 'update':
          body.userId = selectedUser?.id
          body.data = editForm
          break
        case 'delete':
        case 'verify-email':
          body.userId = selectedUser?.id
          break
        case 'send-email':
          body.userId = selectedUser?.id
          body.data = {}
          break
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Action failed')
      }

      setIsDialogOpen(false)
      setSelectedUser(null)
      setActionType('')
      setAddUserForm({ email: '', firstName: '', lastName: '', role: 'INDIVIDUAL', password: '' })
      setEditForm({ firstName: '', lastName: '', role: '' })
      
      // Refresh users list
      fetchUsers()
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
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage all platform users</p>
            </div>
          </div>
          <Button onClick={() => handleAction('create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold">{stats.admins}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Businesses</p>
              <p className="text-2xl font-bold">{stats.businesses}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Individuals</p>
              <p className="text-2xl font-bold">{stats.individuals}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Resellers</p>
              <p className="text-2xl font-bold">{stats.resellers}</p>
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
                  placeholder="Search users by name or email..."
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
                <TabsTrigger value="admins">Admins</TabsTrigger>
                <TabsTrigger value="businesses">Businesses</TabsTrigger>
                <TabsTrigger value="individuals">Individuals</TabsTrigger>
                <TabsTrigger value="resellers">Resellers</TabsTrigger>
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
                    <Button variant="outline" onClick={fetchUsers} className="mt-4">
                      Retry
                    </Button>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">
                                    {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">
                                    {user.firstName} {user.lastName}
                                  </span>
                                  {user.business && (
                                    <p className="text-xs text-muted-foreground">{user.business.name}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{user.email}</TableCell>
                            <TableCell>
                              <Badge className={roleColors[user.role] || 'bg-gray-500/10 text-gray-500'}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{formatDate(user.createdAt)}</TableCell>
                            <TableCell>
                              {user.emailVerified ? (
                                <span className="inline-flex items-center text-green-600 text-sm">
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-yellow-600 text-sm">
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
                                  <DropdownMenuItem onClick={() => handleAction('edit', user)}>
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAction('send-email', user)}>
                                    Password Reset Email
                                  </DropdownMenuItem>
                                  {!user.emailVerified && (
                                    <DropdownMenuItem onClick={() => handleAction('verify-email', user)}>
                                      Verify Email
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleAction('delete', user)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    Delete User
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'create' && 'Add New User'}
              {actionType === 'edit' && 'Edit User'}
              {actionType === 'delete' && 'Delete User'}
              {actionType === 'verify-email' && 'Verify Email'}
              {actionType === 'send-email' && 'Send Password Reset'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'create' && 'Create a new platform user'}
              {actionType === 'edit' && `Editing ${selectedUser?.email}`}
              {actionType === 'delete' && `This will permanently delete ${selectedUser?.email}`}
              {actionType === 'verify-email' && `Verify email for ${selectedUser?.email}`}
              {actionType === 'send-email' && `Send password reset email to ${selectedUser?.email}`}
            </DialogDescription>
          </DialogHeader>

          {/* Add User Form */}
          {actionType === 'create' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="addEmail">Email</Label>
                <Input
                  id="addEmail"
                  type="email"
                  value={addUserForm.email}
                  onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addFirstName">First Name</Label>
                  <Input
                    id="addFirstName"
                    value={addUserForm.firstName}
                    onChange={(e) => setAddUserForm({ ...addUserForm, firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addLastName">Last Name</Label>
                  <Input
                    id="addLastName"
                    value={addUserForm.lastName}
                    onChange={(e) => setAddUserForm({ ...addUserForm, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="addRole">Role</Label>
                <select
                  id="addRole"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                  value={addUserForm.role}
                  onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value })}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="BUSINESS">Business</option>
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="RESELLER">Reseller</option>
                  <option value="SUPPORT">Support</option>
                </select>
              </div>
              <div the="space-y-2">
                <Label htmlFor="addPassword">Temporary Password</Label>
                <Input
                  id="addPassword"
                  type="password"
                  value={addUserForm.password}
                  onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
                  placeholder="Leave blank for auto-generated"
                />
              </div>
            </div>
          )}

          {/* Edit User Form */}
          {actionType === 'edit' && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRole">Role</Label>
                <select
                  id="editRole"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="BUSINESS">Business</option>
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="RESELLER">Reseller</option>
                  <option value="SUPPORT">Support</option>
                </select>
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          {actionType === 'delete' && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
            </div>
          )}

          {/* Verify Email */}
          {actionType === 'verify-email' && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Mark the email for {selectedUser?.email} as verified.
              </p>
            </div>
          )}

          {/* Send Email */}
          {actionType === 'send-email' && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                This will send a password reset email to {selectedUser?.email}.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={executeAction} 
              disabled={isProcessing || (actionType === 'create' && !addUserForm.email)}
              variant={actionType === 'delete' ? 'destructive' : 'default'}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : actionType === 'create' ? 'Create User' :
                 actionType === 'edit' ? 'Save Changes' :
                 actionType === 'delete' ? 'Delete User' :
                 actionType === 'verify-email' ? 'Verify Email' :
                 actionType === 'send-email' ? 'Send Email' :
                 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
