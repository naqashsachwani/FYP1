import { getAuth } from "@clerk/nextjs/server"
import authSeller from "@/middlewares/authSeller"
import { NextResponse } from "next/server"
import imagekit from "@/configs/imageKit"
import prisma from "@/lib/prisma"

// 🟢 Get all products
export async function GET(request) {
  try {
    const { userId } = getAuth(request)
    const storeId = await authSeller(userId)

    if (!storeId) return NextResponse.json({ error: "Not authorized" }, { status: 401 })

    const products = await prisma.product.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// 🟢 Add product
export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    const storeId = await authSeller(userId)

    if (!storeId) return NextResponse.json({ error: "Not authorized" }, { status: 401 })

    const formData = await request.formData()
    const name = formData.get("name")
    const description = formData.get("description")
    const mrp = Number(formData.get("mrp"))
    const price = Number(formData.get("price"))
    const category = formData.get("category")
    const images = formData.getAll("images")

    if (!name || !description || !mrp || !price || !category || images.length < 1)
      return NextResponse.json({ error: "Missing product details" }, { status: 400 })

    const imageUrls = await Promise.all(
      images.map(async (image) => {
        const buffer = Buffer.from(await image.arrayBuffer())
        const response = await imagekit.upload({
          file: buffer,
          fileName: image.name,
          folder: "products",
        })
        return imagekit.url({
          path: response.filePath,
          transformation: [{ quality: "auto" }, { format: "webp" }, { width: "1024" }],
        })
      })
    )

    await prisma.product.create({
      data: { name, description, mrp, price, category, images: imageUrls, storeId },
    })

    return NextResponse.json({ message: "Product added successfully" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// 🟡 Edit product
export async function PUT(request) {
  try {
    const { userId } = getAuth(request)
    const storeId = await authSeller(userId)
    const { id, name, description, price, mrp } = await request.json()

    if (!storeId) return NextResponse.json({ error: "Not authorized" }, { status: 401 })

    await prisma.product.update({
      where: { id },
      data: { name, description, price: Number(price), mrp: Number(mrp) },
    })

    return NextResponse.json({ message: "Product updated successfully" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// 🔴 Delete product
export async function DELETE(request) {
  try {
    const { userId } = getAuth(request)
    const storeId = await authSeller(userId)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!storeId) return NextResponse.json({ error: "Not authorized" }, { status: 401 })
    if (!id) return NextResponse.json({ error: "Missing product ID" }, { status: 400 })

    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
