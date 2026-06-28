import CourseDetailClient from './CourseDetailClient';

export async function generateStaticParams() {
    return [{ id: 'id' }];
}

export default function Page() {
    return <CourseDetailClient />;
}
