import Link from "next/link";

interface Props {
  params: Promise<{ code: string; message: string }>;
}

export default async function FailPage({ params }: Props) {
  const { code, message } = await params;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center space-y-6 border border-red-100">
        <h2 className="text-2xl font-semibold text-red-600">결제 실패</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium text-gray-800">에러 코드:</span> {code}
          </p>
          <p>
            <span className="font-medium text-gray-800">실패 사유:</span> {message}
          </p>
        </div>
        <Link
          href="/"
          className="inline-block mt-4 px-5 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
