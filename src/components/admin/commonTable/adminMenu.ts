export type AdminMenuItem = {
  label: string;
  href: string;
  icon: string;
};

export type AdminMenuSection = {
  title: string;
  items: AdminMenuItem[];
};

export const adminMenuSections: AdminMenuSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "//dashboard",
        icon: "layout-dashboard",
      },
    ],
  },
  {
    title: "Catalog",
    items: [
      {
        label: "Products",
        href: "//products",
        icon: "package",
      },
      {
        label: "Categories",
        href: "//categories",
        icon: "layout-grid",
      },
      {
        label: "Brands",
        href: "//brands",
        icon: "award",
      },
      {
        label: "Attributes",
        href: "//attributes",
        icon: "sliders-horizontal",
      },
    ],
  },
  {
    title: "Marketing",
    items: [
      {
        label: "Offers & Deals",
        href: "//offers",
        icon: "percent",
      },
      {
        label: "Coupons",
        href: "//coupons",
        icon: "ticket",
      },
      {
        label: "Banners",
        href: "//banners",
        icon: "image",
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        label: "CMS Pages",
        href: "//cms-pages",
        icon: "file-text",
      },
      {
        label: "Reviews",
        href: "//reviews",
        icon: "star",
      },
      {
        label: "Website layout",
        href: "//website-layout",
        icon: "layout-template",
      },
    ],
  },
  {
    title: "Blog",
    items: [
      {
        label: "Blog Posts",
        href: "//blogs",
        icon: "newspaper",
      },
      {
        label: "Blog Categories",
        href: "//blog-categories",
        icon: "folder-tree",
      },
      {
        label: "Blog Tags",
        href: "//blog-tags",
        icon: "hash",
      },
    ],
  },
  {
    title: "Customers",
    items: [
      {
        label: "Orders",
        href: "//orders",
        icon: "clipboard-list",
      },
      {
        label: "User",
        href: "//customers",
        icon: "users",
      },
      {
        label: "Delete Requests",
        href: "//delete-requests",
        icon: "user-x",
      },
      {
        label: "Product Reviews",
        href: "//product-reviews",
        icon: "message-square-text",
      },
      {
        label: "Product FAQ",
        href: "//product-faq",
        icon: "message-circle-question",
      },
      {
        label: "Contact Us Leads",
        href: "//contact-us-leads",
        icon: "mail",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        href: "//settings",
        label: "Settings",
        icon: "settings",
      },
    ],
  },
];
