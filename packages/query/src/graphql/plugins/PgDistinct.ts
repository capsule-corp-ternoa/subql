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
                  SELECT DISTINCT ON (serie_id) nft_entities.* 
                  FROM public.nft_entities
                  ${listed.value !== undefined || owner.value !== undefined ? sql.fragment` WHERE ` : sql.fragment``}
                  ${listed.value === 1 ? sql.fragment`listed=1` : sql.fragment``}
                  ${listed.value === 0 ? sql.fragment`listed=0` : sql.fragment``}
                  ${owner.value !== undefined ? 
                    listed.value !== undefined ?
                    sql.fragment` and owner=${owner}`
                    :
                      sql.fragment`owner=${owner}`
                  :
                    sql.fragment``
                  }
                  ${listed.value === undefined ? sql.fragment` ORDER BY serie_id, listed desc` : sql.fragment``}
                )`,
                () => {}
            )
        },
      }
    },
  };
});

