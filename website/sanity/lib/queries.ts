import { groq } from "next-sanity";

// Inventory queries
export const allInventoryQuery = groq`
  *[_type == "inventory"] | order(year desc) {
    _id,
    title,
    slug,
    trailerType,
    make,
    year,
    model,
    length,
    axles,
    interior,
    description,
    price,
    quantity,
    featured,
    "photos": photos[].asset->url
  }
`;

export const featuredInventoryQuery = groq`
  *[_type == "inventory" && featured == true] | order(year desc) [0...4] {
    _id,
    title,
    slug,
    trailerType,
    make,
    year,
    model,
    length,
    price,
    quantity,
    "photo": photos[0].asset->url
  }
`;

// Blog queries
export const allPostsQuery = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    featuredImage,
    publishedAt,
    "author": author->{ name, image },
    "categories": categories[]->{ title, slug },
    tags
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    featuredImage,
    publishedAt,
    body,
    "author": author->{ name, slug, image, bio },
    "categories": categories[]->{ title, slug },
    tags
  }
`;

export const allCategoriesQuery = groq`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description
  }
`;

export const postsByCategoryQuery = groq`
  *[_type == "post" && $categorySlug in categories[]->slug.current] | order(publishedAt desc) {
    _id,
    title,
    slug,
    featuredImage,
    publishedAt,
    "author": author->{ name, image },
    "categories": categories[]->{ title, slug },
    tags
  }
`;
