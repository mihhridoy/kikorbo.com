import { ConsultationRoomClient } from './ConsultationRoomClient';

export default function ConsultationRoomPage({ params }: { params: { roomId: string } }) {
  return <ConsultationRoomClient roomId={params.roomId} />;
}
