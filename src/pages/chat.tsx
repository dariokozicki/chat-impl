import { NextPage } from "next";
import { api } from "../utils/api";
import { useEffect, useRef, useState } from "react";
import { Option } from "../types/dropdown";
import { Dropdown } from "primereact/dropdown";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import styles from "../styles/chat.module.scss";
import { classNames } from "primereact/utils";
import { InputText } from "primereact/inputtext";
import { Message as MsgType } from "@prisma/client";
import { Message } from "./components/message";

const orderByOptions: Option[] = [
  { value: "id", label: "Time" },
  { value: "content", label: "Text" },
];

const orderOptions = {
  asc: "Asc",
  desc: "Desc",
};

const Chat: NextPage = () => {
  const utils = api.useContext();
  const [selectedSort, setSelectedSort] = useState(orderByOptions[0]);
  const [selectedOrder, setSelectedOrder] = useState(orderOptions.asc);

  const sendMessage = api.msg.add.useMutation({
    onMutate: async (newEntry) => {
      utils.msg.list.setData(
        {
          orderBy: {
            key: selectedSort!.value as "id" | "content",
            order: selectedOrder as "asc" | "desc",
          },
        },
        (prevEntries) => {
          const msg: MsgType = {
            content: newEntry.content,
            id: "",
            datetime: new Date(),
            fileUrl: null,
          };
          if (prevEntries) {
            return {
              items: [msg, ...prevEntries.items],
              nextCursor: prevEntries.nextCursor,
            };
          } else {
            return { items: [msg], nextCursor: undefined };
          }
        }
      );
    },
    onSettled: async () => {
      await utils.msg.list.invalidate();
    },
  });
  const [text, setText] = useState("");
  const msgs = api.msg.list.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const onSendMessage = () => {
    if (text) {
      sendMessage.mutate({ content: text });
      setText("");
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [msgs.dataUpdatedAt]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Card
        className={classNames("m-auto h-96 w-1/3 p-0 first:p-0", styles.Chat)}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 w-full flex-grow-0 flex-row gap-4 bg-blue-400 p-2 shadow-lg shadow-gray-400">
            <Dropdown
              value={selectedSort}
              placeholder="Order by..."
              onChange={(e) => setSelectedSort(e.value)}
              options={orderByOptions}
              className="md:w-14rem w-full"
            />
            <Button
              label={orderOptions.asc}
              className={
                selectedOrder === orderOptions.asc
                  ? "p-button-info"
                  : "hover:bg-whitee bg-white text-black"
              }
              onClick={() => setSelectedOrder(orderOptions.asc)}
            />
            <Button
              label={orderOptions.desc}
              className={
                selectedOrder === orderOptions.desc
                  ? "p-button-info"
                  : "bg-white text-black hover:bg-white"
              }
              onClick={() => setSelectedOrder(orderOptions.desc)}
            />
          </div>
          <div className="h-full flex-grow overflow-y-scroll bg-gray-300">
            {msgs.data?.pages
              .flatMap((page) => page.items)
              .map((message) => (
                <Message message={message} key={message.id} />
              ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex flex-row gap-3 p-2">
            <InputText
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full flex-grow-0"
            />
            <Button
              onClick={onSendMessage}
              label="SEND"
              className="p-button-info"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Chat;
