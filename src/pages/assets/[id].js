import { useRouter } from 'next/router';

const Asset = () => {
  const router = useRouter();
  const { id } = router.query;

  // If the page is not yet generated, this will be displayed initially until the id is fetched.
  if (!id) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Asset ID: {id}</h1>
    </div>
  );
};

export default Asset;
