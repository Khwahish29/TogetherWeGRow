import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container-page py-20 text-center">
      <h1 className="text-3xl font-bold">We couldn't find that page</h1>
      <p className="mt-3">It may have moved. Nothing is broken on your side.</p>
      <Link to="/" className="btn-primary mt-6">
        Go to the home page
      </Link>
    </div>
  );
}
