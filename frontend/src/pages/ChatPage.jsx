import React from "react";
import Layout from "../components/Layout";
import Chat from "../components/Chat";

const ChatPage = () => {
  return (
    <Layout>
      <div className="w-full h-[calc(100vh-120px)] min-h-[500px] bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex flex-col relative">
        <Chat isFullPage={true} />
      </div>
    </Layout>
  );
};

export default ChatPage;
