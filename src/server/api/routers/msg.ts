import { ORDER, ORDER_BY_KEYS } from "../../../constants/constants";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

export const msgRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        orderBy: z.object({ key: z.enum(ORDER_BY_KEYS), order: z.enum(ORDER) }),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.prisma.message.findMany({
        cursor: { id: input.cursor },
        orderBy: {
          ...(input.orderBy.key === ORDER_BY_KEYS[0] && {
            id: input.orderBy.order,
          }),
          ...(input.orderBy.key === ORDER_BY_KEYS[1] && {
            content: input.orderBy.order,
          }),
        },
      });
    }),

  add: publicProcedure
    .input(z.object({ content: z.string(), hasImage: z.boolean().optional() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.message.create({
        data: {
          fileUrl: null,
          content: input.content,
          datetime: new Date(),
        },
      });
    }),

  delete: publicProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
