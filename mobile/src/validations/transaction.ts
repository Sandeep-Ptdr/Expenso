import { z } from "zod";

export const transactionSchema = z
  .object({
    type: z.enum(["income", "expense", "transfer"]),
    amount: z
      .string()
      .trim()
      .min(1, "Amount is required.")
      .refine((value) => Number(value) > 0, "Amount must be greater than 0."),
    category: z
      .string()
      .trim()
      .min(1, "Category is required.")
      .max(50, "Category must be at most 50 characters long."),
    paymentMethod: z.enum(["cash", "online"]),
    description: z
      .string()
      .trim()
      .max(250, "Description must be at most 250 characters long.")
      .optional()
      .or(z.literal("")),
    date: z
      .string()
      .trim()
      .min(1, "Date is required.")
      .refine(
        (value) => !Number.isNaN(new Date(value).getTime()),
        "Please enter a valid date in YYYY-MM-DD format."
      ),
    person: z
      .string()
      .trim()
      .max(100, "Person must be at most 100 characters long.")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    if (value.type === "transfer" && !value.person?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Person is required for transfer transactions.",
        path: ["person"],
      });
    }
  });

export type TransactionFormValues = z.infer<typeof transactionSchema>;
