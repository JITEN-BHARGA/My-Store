import { connectDB } from "@/app/_lib/databaseConnection";
import product from "@/module/product";
import { NextRequest, NextResponse } from "next/server";
import { removeStopwords } from "stopword";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;

    const keyword = searchParams.get("keyword")?.trim().toLowerCase();
    const company = searchParams.get("company");
    const gender = searchParams.get("gender");
    const minprice = searchParams.get("minprice");
    const maxprice = searchParams.get("maxprice");
    const discount = searchParams.get("discount");
    const category = searchParams.get("category");

    let filter: any = {};

    /* 🔎 KEYWORD SEARCH WITH STOPWORDS */
    if (keyword) {
      const words = keyword.split(/\s+/);
      const cleanWords = removeStopwords(words);

      if (cleanWords.length > 0) {
        const regexArray = cleanWords.map((word: string) => ({
          $or: [
            { name: { $regex: word, $options: "i" } },
            { companyName: { $regex: word, $options: "i" } },
            { category: { $regex: word, $options: "i" } },
            { gender: { $regex: word, $options: "i" } },
          ],
        }));

        filter.$and = regexArray;
      }
    }

    if (category) {
      filter.category = category;
    }

    /* 🏷️ BRAND FILTER */
    if (company) {
      filter.companyName = { $regex: `^${company}$`, $options: "i" };
    }

    /* 👤 GENDER FILTER */
    if (gender) {
      filter.gender = { $regex: `^${gender}$`, $options: "i" };
    }

    /* 💰 PRICE FILTER */
    if (minprice || maxprice) {
      filter.finalPrice = {};

      if (minprice) filter.finalPrice.$gte = Number(minprice);
      if (maxprice) filter.finalPrice.$lte = Number(maxprice);
    }

    /* 🔥 DISCOUNT FILTER */
    if (discount) {
      filter.discount = { $gte: Number(discount) };
    }

    const data = await product.find(filter);

    return NextResponse.json(
      {
        success: true,
        count: data.length,
        data,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
