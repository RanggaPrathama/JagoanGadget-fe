export interface MockProduct {
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  features: string[];
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    slug: "laptop-pro-15",
    name: "Laptop Pro 15",
    price: 24999000,
    originalPrice: 28999000,
    image: "",
    category: "Laptop",
    description:
      "Powerful laptop with stunning display, all-day battery, and cutting-edge performance for professionals.",
    features: [
      "15-inch Liquid Retina display",
      "Up to 18 hours of battery life",
      "Next-gen processor with 12 cores",
      "1TB SSD storage",
      "16GB unified memory",
    ],
  },
  {
    slug: "wireless-earbuds-pro",
    name: "Wireless Earbuds Pro",
    price: 3499000,
    originalPrice: 4299000,
    image: "",
    category: "Audio",
    description:
      "Immersive sound with active noise cancellation. Adaptive EQ adjusts music to the shape of your ear.",
    features: [
      "Active Noise Cancellation",
      "Adaptive EQ",
      "IPX4 water resistant",
      "6 hours listening time",
      "Wireless charging case",
    ],
  },
  {
    slug: "smartwatch-series-3",
    name: "Smartwatch Series 3",
    price: 6999000,
    originalPrice: undefined,
    image: "",
    category: "Wearable",
    description:
      "Advanced health monitoring, always-on display, and seamless connectivity.",
    features: [
      "Blood oxygen sensor",
      "ECG app",
      "Always-on Retina display",
      "Water resistant to 50m",
      "18-hour battery life",
    ],
  },
  {
    slug: "tablet-air-11",
    name: "Tablet Air 11",
    price: 10999000,
    originalPrice: 12999000,
    image: "",
    category: "Tablet",
    description:
      "Ultra-thin tablet with brilliant display, powerful chip, and support for stylus and keyboard.",
    features: [
      "11-inch Liquid Retina display",
      "M-series chip",
      "Support for Stylus Gen 2",
      "All-day battery life",
      "Ultra-slim design at 5.9mm",
    ],
  },
  {
    slug: "mechanical-keyboard",
    name: "Mechanical Keyboard RGB",
    price: 1899000,
    originalPrice: undefined,
    image: "",
    category: "Accessories",
    description:
      "Premium mechanical keyboard with hot-swappable switches and per-key RGB lighting.",
    features: [
      "Hot-swappable switches",
      "Per-key RGB lighting",
      "Aluminum frame",
      "USB-C detachable cable",
      "Full NKRO support",
    ],
  },
  {
    slug: "wireless-charger-3in1",
    name: "Wireless Charger 3-in-1",
    price: 899000,
    originalPrice: 1099000,
    image: "",
    category: "Accessories",
    description:
      "Charge your phone, watch, and earbuds simultaneously with a single sleek pad.",
    features: [
      "15W fast charging",
      "Works with all Qi devices",
      "LED charging indicator",
      "Silicone anti-slip surface",
      "Overheat protection",
    ],
  },
  {
    slug: "monitor-ultrawide-34",
    name: "Ultrawide Monitor 34",
    price: 12499000,
    originalPrice: undefined,
    image: "",
    category: "Monitor",
    description:
      "Immersive 34-inch ultrawide display with accurate colors and smooth 120Hz refresh rate.",
    features: [
      "34-inch IPS panel",
      "3440x1440 resolution",
      "120Hz refresh rate",
      "98% DCI-P3 color gamut",
      "USB-C hub built-in",
    ],
  },
  {
    slug: "portable-speaker-bloom",
    name: "Portable Speaker Bloom",
    price: 2499000,
    originalPrice: 2999000,
    image: "",
    category: "Audio",
    description:
      "360-degree sound in a compact, durable design. Take your music anywhere.",
    features: [
      "360-degree sound",
      "IP67 waterproof",
      "12-hour battery",
      "Bluetooth 5.3",
      "Built-in microphone",
    ],
  },
  {
    slug: "usb-c-hub-pro",
    name: "USB-C Hub Pro 7-in-1",
    price: 599000,
    originalPrice: undefined,
    image: "",
    category: "Accessories",
    description:
      "Expand your laptop with 7 essential ports in a compact aluminum hub.",
    features: [
      "4K HDMI output",
      "100W Power Delivery",
      "SD card reader",
      "USB 3.2 Gen 2",
      "Gigabit Ethernet",
    ],
  },
];

export const MOCK_CATEGORIES = [
  { name: "Laptop", slug: "laptop" },
  { name: "Audio", slug: "audio" },
  { name: "Wearable", slug: "wearable" },
  { name: "Tablet", slug: "tablet" },
  { name: "Accessories", slug: "accessories" },
  { name: "Monitor", slug: "monitor" },
];
