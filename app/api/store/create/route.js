import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import imagekit from "@/configs/imageKit"

export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await request.formData()
    
    // Extract Data
    const name = formData.get("name")
    const username = formData.get("username")
    const description = formData.get("description")
    const email = formData.get("email")
    const contact = formData.get("contact")
    const address = formData.get("address")
    const imageFile = formData.get("image")
    const cnic = formData.get("cnic")
    const taxId = formData.get("taxId")
    const bankName = formData.get("bankName")
    const accountNumber = formData.get("accountNumber")

    if (!name || !username || !email || !contact || !address || !cnic || !bankName || !accountNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Handle Image Upload
    let logoUrl = null
    if (imageFile && typeof imageFile !== "string") {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const uploadRes = await imagekit.upload({
        file: buffer,
        fileName: `store_logo_${username}`,
        folder: "stores"
      })
      logoUrl = uploadRes.url
    }

    // Check for existing store
    const existingStore = await prisma.store.findUnique({ where: { userId } })

    // ✅ LOGIC UPDATE: Resubmission Handling
    if (existingStore) {
        if (existingStore.status === 'approved') {
            return NextResponse.json({ error: "Store already exists" }, { status: 400 })
        } else if (existingStore.status === 'pending') {
            return NextResponse.json({ error: "Application already under review" }, { status: 400 })
        }
        
        // If status is 'rejected' (or anything else), we ALLOW update (Resubmission)
        await prisma.$transaction(async (tx) => {
            // 1. Update Store
            const updateData = {
                name, username, description, email, contact, address,
                status: "pending", // Reset to pending
                isActive: false
            }
            if (logoUrl) updateData.logo = logoUrl // Only update logo if a new one was uploaded

            await tx.store.update({
                where: { id: existingStore.id },
                data: updateData
            })

            // 2. Update Application (or recreate if missing)
            const appData = {
                businessName: name,
                contactEmail: email,
                contactPhone: contact,
                address: address,
                cnic: cnic,
                taxId: taxId || null,
                bankName: bankName,
                accountNumber: accountNumber,
                status: "PENDING", // Reset to pending
                reviewNotes: null, // Clear previous rejection notes
                reviewedBy: null,
                reviewedAt: null
            }
            
            // Upsert ensures we update if exists, create if somehow missing
            await tx.storeApplication.upsert({
                where: { storeId: existingStore.id },
                update: appData,
                create: {
                    userId,
                    storeId: existingStore.id,
                    ...appData,
                    documents: { logo: logoUrl || existingStore.logo }
                }
            })
        })

        return NextResponse.json({ message: "Application resubmitted successfully!" })
    }

    // ✅ NEW CREATION LOGIC (For fresh users)
    await prisma.$transaction(async (tx) => {
      const newStore = await tx.store.create({
        data: {
          userId,
          name,
          username,
          description,
          email,
          contact,
          address,
          logo: logoUrl || "", 
          status: "pending",
          isActive: false 
        }
      })

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
          documents: { logo: logoUrl },
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