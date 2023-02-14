import { Message as MsgType } from "@prisma/client";

type MessageProps = {
  message: MsgType;
};

export const Message = ({ message }: MessageProps) => {
  return (
    <div className="flex w-fit flex-col gap-2 p-3">
      <div className="h-8 w-fit rounded-md bg-white px-3 text-xl">
        {message.content}
      </div>
      {message.fileUrl && (
        <div className="h-32 w-auto">
          <img src={message.fileUrl} />
        </div>
      )}
      <div className="text-sm">{message.datetime.toDateString()}</div>
    </div>
  );
};
