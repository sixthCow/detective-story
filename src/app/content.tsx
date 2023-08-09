"use client";

// import Audio from "@/components/Audio";
import NotebookEntry from "@/components/NotebookEntry";
import Scene from "@/components/Scene";
import { ChatCompletionRequestMessage } from "openai";
import { FormEventHandler, useCallback, useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

type Tokens = { clues: number; pass: number; complete: boolean };

async function sendMessage(content: string, context: ChatCompletionRequestMessage[]) {
  let response;
  try {
    response = await window.fetch("/api/ai", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: content, context }),
    });
  } catch (error) {
    console.error(error);
  } finally {
    console.log("finally response", response);
    if (!response) return undefined;
    const { message } = await response.json();
    return message as ChatCompletionRequestMessage;
  }
}

export function extractTokens(message: string) {
  const tokens: Partial<Tokens> = {};

  const clues = message.match(/CLUES:(\d)/);
  if (clues) tokens.clues = parseInt(clues[1]);

  const passengers = message.match(/PASS:(\d)/);
  if (passengers) tokens.pass = parseInt(passengers[1]);

  const complete = message.match(/COMPLETE/);
  if (complete) tokens.complete = true;

  return tokens;
}

export default function Content() {
  const [chatLog, setChatLog] = useLocalStorage<ChatCompletionRequestMessage[]>("CHAT_LOG", []);
  const [gameTokens, setGameTokens] = useLocalStorage<Tokens>("GAME_TOKENS", {
    clues: 0,
    pass: 0,
    complete: false,
  });
  const [started, setStarted] = useState(chatLog.length > 0);
  const [working, setWorking] = useState(false);

  const chatLogRef = useRef<HTMLUListElement>(null);

  const onClickBegin = useCallback(async () => {
    setWorking(true);
    const response = await sendMessage("", []);
    if (response) {
      setChatLog((chatLog) => chatLog.concat(response));
      setStarted(true);
      setWorking(false);
    }
  }, [setChatLog]);

  const onSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    async (event) => {
      event.preventDefault();
      if (working) return;
      setWorking(true);

      const data = new FormData(event.currentTarget);
      const message = data.get("message");
      if (!message || typeof message !== "string") {
        // TODO: proper error handling
        return;
      }

      if (message === "restart" || message === "reset") {
        // @ts-ignore we have access to named inputs in the form
        event.target.elements.message.value = "";
        setChatLog([]);
        setGameTokens({ clues: 0, pass: 0, complete: false });
        setStarted(false);
        setWorking(false);
        return;
      }

      const response = await sendMessage(
        message,
        chatLog.filter((message) => message.role !== "system")
      );
      if (response) {
        // @ts-ignore we have access to named inputs in the form
        event.target.elements.message.value = "";

        if (response) {
          setChatLog((log) => log.concat({ role: "user", content: message }, response));
          setGameTokens((gameTokens) => ({
            ...gameTokens,
            //@ts-ignore
            ...extractTokens(response.content),
          }));
        }
        setTimeout(() => {
          chatLogRef.current?.scrollTo({ top: chatLogRef.current.scrollHeight, behavior: "smooth" });
        }, 250);
      }
      setWorking(false);
    },
    [chatLog, setChatLog, setGameTokens, working]
  );

  console.log({ chatLog, gameTokens });

  return (
    <>
      <aside className="bg-amber-100 text-blue-900 py-4 w-1/2 min-w-[360px] flex flex-col max-h-screen overflow-hidden z-10">
        <hgroup className="px-4 border-b border-blue-950 text-xl tracking-widest mb-4 italic text-blue-700">
          <h2>Detective&apos;s Notes</h2>
        </hgroup>
        {chatLog.length === 0 && (
          <div className="px-4 text-blue-900/75 tracking-widest italic text-lg">
            <p className="mb-4">
              You are Detective Layton, an experienced investigator renowned for your sharp deductive skills.
            </p>
            <p className="mb-4">
              It is the 1920s, and you are on vacation aboard the renowned Mystery Express, a train known for its
              immersive murder mystery experiences. It&apos;s an opportunity to unwind and put your sleuthing abilities
              to the test in a simulated crime scenario.
            </p>
            <p className="mb-4">
              However, as the train traverses the picturesque countryside, a shocking twist unfolds. You are called upon
              to investigate a real murder that has taken place on board!
            </p>
            <p className="mb-4">
              You can type in &quot;reset&quot; or &quot;restart&quot; at any point to start over and get a new prompt.
            </p>
            <p className="text-center">

              <button
                className="px-4 py-2 bg-amber-700/75 border-4 border-amber-900 text-amber-950 hover:text-amber-100 rounded tracking-widest transition hover:scale-110 disabled:opacity-0"
                onClick={onClickBegin}
                disabled={working || started}
              >
                Start Investigating
              </button>
            </p>
          </div>
        )}
        <ul ref={chatLogRef} className="h-full w-full text-lg overflow-auto px-4 tracking-widest">
          {chatLog.map((message, i) => (
            <NotebookEntry key={i} message={message} />
          ))}
        </ul>
      </aside>
      <section className="flex flex-col w-full">
        
        <div
          style={{ backgroundImage: 'url("/express-bg.png")' }}
          className="landscape relative flex items-center justify-center h-full bg-[100%] bg-repeat-x"
        >
            
         
          <Scene
            started={started}
            working={working}
            clues={gameTokens.clues}
            passengers={gameTokens.pass}
            complete={gameTokens.complete}
          />
        </div>
        <form className="w-full" onSubmit={onSubmit}>
          <input
            className="text-xl tracking-widest p-4 w-full transition text-blue-900"
            placeholder="Write in my notebook..."
            name="message"
            required
            hidden={!started}
            disabled={working}
          />
          <button hidden type="submit" />
        </form>
      </section>
    </>
  );
}
