using System;
using System.Collections.Generic;
using System.Linq;

namespace IsPrimeRuntimeComponent
{
    public sealed class IsPrimeRT
    {
        static public long[] Batch(long candidate, long startAt, long batchSize, long endAt)
        {
            long stopAt = Math.Min(startAt + batchSize - 1, endAt);
            List<long> results = new List<long>();
            if (candidate == 2)
            {
                return results.ToArray<long>();
            }
            for (long i = startAt; i <= stopAt; i++)
            {
                if ((candidate % i) == 0)
                {
                    results.Add(i);
                }
            }
            return results.ToArray<long>();
        }
    }
}