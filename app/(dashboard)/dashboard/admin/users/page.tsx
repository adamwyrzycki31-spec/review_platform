"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Search, Filter, MoreHorizontal, Shield, UserCog, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Mock users for demonstration (in production, fetch from API)
const mockUsers = [
  { id: '1', email: 'admin@myprotector.org', firstName: 'Admin', lastName: 'User', role: 'ADMIN', createdAt: '2024-01-01' },
  { id: '2', email: 'business@techcorp.com', firstName: 'John', lastName: 'Doe', role: 'BUSINESS', createdAt: '2024-02-15' },
  { id: '3', email: 'individual@example.com', firstName: 'Jane', lastName: 'Smith', role: 'INDIVIDUAL', createdAt: '2024-03-01' },
  { id: '4', email: 'reseller@partner.com', firstName: 'Bob', lastName: 'Wilson', role: 'RESELLER', createdAt: '2024-03-15' },
  { id: '5', email: 'support@myprotector.org', firstName: 'Sarah', lastName: 'Johnson', role: 'SUPPORT', createdAt: '2024-04-01' },
]

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-500/10 text-red-500',
  BUSINESS: 'bg-blue-500/10 text-blue-500',
  INDIVIDUAL: 'bg-green-500/10 text-green-500',
  RESELLER: 'bg-purple-500/10 text-purple-500',
  SUPPORT: 'bg-yellow-500/10 text-yellow-500',
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-app py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage all platform users</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{mockUsers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold">{mockUsers.filter(u => u.role === 'ADMIN').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Businesses</p>
              <p className="text-2xl font-bold">{mockUsers.filter(u => u.role === 'BUSINESS').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Individuals</p>
              <p className="text-2xl font-bold">{mockUsers.filter(u => u.role === 'INDIVIDUAL').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Resellers</p>
              <p className="text-2xl font-bold">{mockUsers.filter(u => u.role === 'RESELLER').length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
            <TabsTrigger value="businesses">Businesses</TabsTrigger>
            <TabsTrigger value="individuals">Individuals</TabsTrigger>
            <TabsTrigger value="resellers">Resellers</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Manage platform users and roles</CardDescription>
                  </div>
                  <Button>
                    <Shield className="h-4 w-4 mr-2" />
                    Add Admin
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="BUSINESS">Business</option>
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="RESELLER">Reseller</option>
                    <option value="SUPPORT">Support</option>
                  </select>
                </div>

                {/* Users Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
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
                                  {user.firstName?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <span className="font-medium">
                                {user.firstName} {user.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={roleColors[user.role]}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.createdAt}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <UserCog className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Verify Email
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Admins with full platform access</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="businesses">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Business account holders</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="individuals">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Individual reviewers</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resellers">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Reseller partners</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}