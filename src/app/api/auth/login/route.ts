import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { verifyPassword, createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        const isValid = await verifyPassword(password, user.password)

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        await createSession(user.id)

        return NextResponse.json(
            { user: { id: user.id, email: user.email, name: user.name } },
            { status: 200 }
        )
  } catch (error) {
        console.error('Login error:', error)
        // Provide a more actionable message if the error is Prisma schema related
        const err = error as any
        if (err?.code === 'P2022' || (error as any) instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json(
                { error: 'Database schema mismatch. Please run database migrations to align Prisma schema with the database.' },
                { status: 500 }
            )
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
  }
}
