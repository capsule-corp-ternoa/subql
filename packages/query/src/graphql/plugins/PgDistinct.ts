import {makeExtendSchemaPlugin, gql} from 'graphile-utils';

export const PgDistinct =  makeExtendSchemaPlugin((build) => {
  // Get any helpers we need from `build`
  const { pgSql: sql, inflection } = build;

  return {
    typeDefs: gql`
        extend type Query {
            distinctSerieNfts(listed: Int, owner: String, marketplaceId: String, isCapsule: Boolean): NftEntitiesConnection
        }
    `,
    resolvers: {
      Query: {
        distinctSerieNfts: async (_query, args, context, resolveInfo) => {
            const listed = sql.value(args.listed)
            const owner = sql.value(args.owner)
            const marketplaceId = sql.value(args.marketplaceId)
            const isCapsule = sql.value(args.isCapsule)
            return resolveInfo.graphile.selectGraphQLResultFromTable(
              sql.fragment`(
                SELECT DISTINCT ON (serie_id) nft_entities.* 
                FROM subql_ternoa.nft_entities
                WHERE timestamp_burn IS NULL
                AND serie_id <> '0'
                ${marketplaceId.value !== undefined ? sql.fragment` AND (marketplace_id=${marketplaceId} OR listed=0)` : sql.fragment``}
                ${listed.value === 1 ? sql.fragment` AND listed=1` : sql.fragment``}
                ${listed.value === 0 ? sql.fragment` AND listed=0` : sql.fragment``}
                ${isCapsule.value === true ? sql.fragment` AND is_capsule=true` : sql.fragment``}
                ${isCapsule.value === false ? sql.fragment` AND is_capsule=false` : sql.fragment``}
                ${owner.value !== undefined ? sql.fragment` AND owner=${owner}` : sql.fragment``}
                ${(listed.value === undefined && isCapsule.value === undefined) ? 
                  sql.fragment` ORDER BY serie_id, created_at desc, listed desc, is_capsule asc`
                : 
                  listed.value === undefined ? 
                    sql.fragment` ORDER BY serie_id, created_at desc, is_capsule asc`
                  :
                    sql.fragment` ORDER BY serie_id, created_at desc, listed desc`
                }
              )`,
              () => {}
            )
        },
      }
    },
  };
});

