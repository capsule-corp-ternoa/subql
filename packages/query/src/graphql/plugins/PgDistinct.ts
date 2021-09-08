import {makeExtendSchemaPlugin, gql} from 'graphile-utils';

export const PgDistinct =  makeExtendSchemaPlugin((build) => {
  // Get any helpers we need from `build`
  const { pgSql: sql, inflection } = build;

  return {
    typeDefs: gql`
        extend type Query {
            distinctSerieNfts(listed: Int, owner: String): NftEntitiesConnection
        }
    `,
    resolvers: {
      Query: {
        distinctSerieNfts: async (_query, args, context, resolveInfo) => {
            const listed = sql.value(args.listed)
            const owner = sql.value(args.owner)
            return resolveInfo.graphile.selectGraphQLResultFromTable(
                sql.fragment`(
                  ${sql.fragment`(
                    SELECT DISTINCT ON (serie_id) nft_entities.* 
                    FROM public.nft_entities
                    WHERE timestamp_burn IS NULL
                    AND serie_id <> '0'
                    ${listed.value === 1 ? sql.fragment` AND listed=1` : sql.fragment``}
                    ${listed.value === 0 ? sql.fragment` AND listed=0` : sql.fragment``}
                    ${owner.value !== undefined ? sql.fragment` AND owner=${owner}` : sql.fragment``}
                    ${listed.value === undefined ? sql.fragment` ORDER BY serie_id, listed desc` : sql.fragment``}
                  )`}

                  ${sql.fragment`UNION`}

                  ${sql.fragment`(
                    SELECT nft_entities.* 
                    FROM public.nft_entities
                    WHERE timestamp_burn IS NULL
                    AND serie_id = '0'
                    ${listed.value === 1 ? sql.fragment` AND listed=1` : sql.fragment``}
                    ${listed.value === 0 ? sql.fragment` AND listed=0` : sql.fragment``}
                    ${owner.value !== undefined ? sql.fragment` AND owner=${owner}` : sql.fragment``}
                    ${listed.value === undefined ? sql.fragment` ORDER BY serie_id, listed desc` : sql.fragment``}
                  )`}

                  ${listed.value === undefined ? sql.fragment` ORDER BY serie_id, listed desc` : sql.fragment``}
                )`
                ,
                () => {}
            )
        },
      }
    },
  };
});

