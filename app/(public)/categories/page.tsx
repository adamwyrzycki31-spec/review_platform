import Link from 'next/link'
import { ShoppingBag, DollarSign, Cpu, Heart, Home, Car, Wrench, Plane, GraduationCap, Briefcase, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import prisma from '@/lib/db'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse businesses by category. Find trusted companies in retail, finance, technology, healthcare, and more.',
}

const iconMap: Record<string, typeof ShoppingBag> = {
  ShoppingBag,
  DollarSign,
  Cpu,
  Heart,
  Home,
  Car,
  Wrench,
  Plane,
  GraduationCap,
  Briefcase,
}

interface CategoryItem {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  _count: { businesses: number }
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { businesses: true },
      },
    },
  }) as CategoryItem[]

  return (
    <div className="bg-muted/30 py-12">
      <div className="container-app">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold mb-4">Browse by Category</h1>
          <p className="text-xl text-muted-foreground">
            Find trusted businesses in your industry. Each category includes verified companies 
            with our unique traffic light trust system.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon || 'Briefcase'] || Briefcase
            return (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <IconComponent className="h-7 w-7 text-primary group-hover:text-white" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                    )}
                    <p className="text-sm text-primary font-medium">
                      {category._count.businesses.toLocaleString()} businesses
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
