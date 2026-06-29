import VideoPlayerClient from './VideoPlayerClient';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <VideoPlayerClient id={id} />;
}
