export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600">Sorry, we couldn’t find the page you were looking for.</p>
      <a href="/" className="mt-6 text-indigo-600 hover:underline">Return to Dashboard</a>
    </div>
  );
}
