const categoryIcons: Record<string, string> = {
  Electronics: "💻",
  Fashion: "👕",
  "Home & Kitchen": "🏠",
  Beauty: "💄",
  Sports: "⚽",
  Books: "📚",
  Toys: "🧸",
  Groceries: "🛒",
  Mobiles: "📱",
  Accessories: "🎧",
};

type Props = {
  title: string;
};

export function CategoryCard({ title }: Props) {
  return (
    <div className="flex items-center justify-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white shadow flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl cursor-pointer hover:scale-105 transition">
        {categoryIcons[title]}
      </div>
    </div>
  );
}
