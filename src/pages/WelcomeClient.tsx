import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';


const WelcomeClient:React.FC = () => {
  const token = useParams();
  console.log(token);

  return <div>Have a good coding</div>
}
export default WelcomeClient;