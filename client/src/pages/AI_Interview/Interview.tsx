import { isVideoCodec } from '@/types/types';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useParams, useLocation } from 'react-router-dom';
import { PageClientImpl } from './PageClientImpl';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Interview: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const query = useQuery();

  const codecParam = query.get('codec');
  const codec = codecParam && isVideoCodec(codecParam) ? codecParam : 'vp9';

  const hqParam = query.get('hq');
  const hq = hqParam === 'true';

  const region = query.get('region') || undefined;

  return (
    <>
      <Toaster />

      <PageClientImpl
        roomName={interviewId!}
        region={region}
        hq={hq}
        codec={codec}
      />
    </>
  );
};

export default Interview;