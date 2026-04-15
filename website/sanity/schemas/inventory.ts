import { defineType, defineField } from "sanity";

export const inventory = defineType({
  name: "inventory",
  title: "Inventory",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "trailerType",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Dry Van", value: "dry-van" },
          { title: "Reefer", value: "reefer" },
          { title: "Container Chassis", value: "chassis" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "make", title: "Make", type: "string" }),
    defineField({ name: "year", title: "Year", type: "number" }),
    defineField({ name: "model", title: "Model", type: "string" }),
    defineField({ name: "length", title: "Length", type: "string" }),
    defineField({ name: "axles", title: "Axles", type: "string" }),
    defineField({ name: "interior", title: "Interior", type: "string" }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "string",
      description: 'e.g. "$18,500", "Call for Pricing"',
    }),
    defineField({
      name: "quantity",
      title: "Quantity",
      type: "number",
      initialValue: 1,
    }),
    defineField({
      name: "featured",
      title: "Featured on Homepage",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "photos",
      title: "Photos",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "trailerType",
      media: "photos.0",
    },
  },
});
