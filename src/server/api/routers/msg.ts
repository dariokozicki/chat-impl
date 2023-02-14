import { ORDER, ORDER_BY_KEYS } from "../../../constants/constants";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

export const msgRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
        limit: z.number().nullish(),
        orderBy: z
          .object({ key: ORDER_BY_KEYS, order: ORDER })
          .default({ key: ORDER_BY_KEYS.Enum.id, order: ORDER.Enum.asc }),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 10;
      const { cursor } = input;
      const items = await ctx.prisma.message.findMany({
        take: (input.limit || 10) + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          [input.orderBy.key]: input.orderBy.order,
        },
      });
      let nextCursor: string | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem![input.orderBy.key];
      }
      return { items, nextCursor };
    }),

  add: publicProcedure
    .input(z.object({ content: z.string(), hasImage: z.boolean().optional() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.message.create({
        data: {
          fileUrl: null,
          content: input.content,
          datetime: new Date(),
        },
      });
    }),

  delete: publicProcedure.mutation(() => {
    return "you can now see this secret message!";
  }),
});
