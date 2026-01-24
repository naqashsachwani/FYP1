import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import imagekit from "@/configs/imageKit"

export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Check if store already exists
    const existingStore = await prisma.store.findUnique({ where: { userId } })
    if (existingStore) return NextResponse.json({ error: "Store already exists" }, { status: 400 })

    const formData = await request.formData()
    
    // Core Store Info
    const name = formData.get("name")
    const username = formData.get("username")
    const description = formData.get("description")
    const email = formData.get("email")
    const contact = formData.get("contact")
    const address = formData.get("address")
    const imageFile = formData.get("image")

    // Application Info
    const cnic = formData.get("cnic")
    const taxId = formData.get("taxId")
    const bankName = formData.get("bankName")
    const accountNumber = formData.get("accountNumber")

    if (!name || !username || !email || !contact || !address || !cnic || !bankName || !accountNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Upload Logo
    let logoUrl = ""
    if (imageFile && typeof imageFile !== "string") {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const uploadRes = await imagekit.upload({
        file: buffer,
        fileName: `store_logo_${username}`,
        folder: "stores"
      })
      logoUrl = uploadRes.url
    }

    // ✅ TRANSACTION: Create Store AND Application
    await prisma.$transaction(async (tx) => {
      // 1. Create Store (Inactive initially)
      const newStore = await tx.store.create({
        data: {
          userId,
          name,
          username,
          description,
          email,
          contact,
          address,
          logo: logoUrl,
          status: "pending",
          isActive: false 
        }
      })

      // 2. Create Store Application
      await tx.storeApplication.create({
        data: {
          userId,
          storeId: newStore.id,
          businessName: name,
          contactEmail: email,
          contactPhone: contact,
          address: address,
          cnic: cnic,
          taxId: taxId || null,
          bankName: bankName,
          accountNumber: accountNumber,
          documents: { logo: logoUrl }, // Storing logo ref in docs for now
          status: "PENDING"
        }
      })
    })

    return NextResponse.json({ message: "Store application submitted successfully!" })

  } catch (error) {
    console.error("Create Store Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}