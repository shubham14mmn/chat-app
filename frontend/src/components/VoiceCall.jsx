import { useEffect, useRef } from "react";
import Peer from "simple-peer";

export default function VoiceCall({
  socket,
  currentUser,
  remoteUser,
  incomingSignal,
  isCaller,
}) {
  const localAudio = useRef();
  const remoteAudio = useRef();
  const peerRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {

        localAudio.current.srcObject = stream;

        const peer = new Peer({
          initiator: isCaller,
          trickle: false,
          stream,
        });

        peer.on("signal", (signal) => {
          socket.emit("voice-signal", {
            to: remoteUser._id,
            signal,
          });
        });

        peer.on("stream", (remoteStream) => {
          remoteAudio.current.srcObject = remoteStream;
        });

        if (incomingSignal) {
          peer.signal(incomingSignal);
        }

        peerRef.current = peer;
      });

    return () => {
      peerRef.current?.destroy();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center z-50">
      <h2 className="text-2xl font-bold mb-4">
        Voice Call
      </h2>

      <p>Connected with {remoteUser.name}</p>

      <audio ref={localAudio} autoPlay muted />
      <audio ref={remoteAudio} autoPlay />

      <button
        onClick={() => peerRef.current?.destroy()}
        className="mt-6 px-6 py-3 bg-red-600 rounded-full"
      >
        End Call
      </button>
    </div>
  );
}