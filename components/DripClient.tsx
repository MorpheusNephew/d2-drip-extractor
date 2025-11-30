"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { DripResponse } from "@/types/drip";
import LoadingState from "./drip/LoadingState";
import ErrorState from "./drip/ErrorState";
import EmptyState from "./drip/EmptyState";
import DripManifest from "./drip/DripManifest";

export default function DripClient() {
  const { data: session } = useSession();
  const [data, setData] = useState<DripResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/drip");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Request failed: ${res.status}`);
        }
        const json = (await res.json()) as DripResponse;
        setData(json);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (!session) {
    return <></>;
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!data) {
    return <EmptyState />;
  }

  return <DripManifest data={data} />;
}
