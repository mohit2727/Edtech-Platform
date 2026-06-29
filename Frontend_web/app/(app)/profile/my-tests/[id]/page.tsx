import ReviewAttemptClient from './ReviewAttemptClient';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ReviewAttemptClient id={id} />;
}
