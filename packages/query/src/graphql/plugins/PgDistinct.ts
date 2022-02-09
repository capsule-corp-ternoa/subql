import {makeExtendSchemaPlugin, gql} from 'graphile-utils';

export const PgDistinct =  makeExtendSchemaPlugin((build) => {
  const { pgSql: sql, inflection } = build;
  return {
    typeDefs: gql`
      extend type Query {
        distinctSerieNfts(
          listed: Int, 
          owner: String, 
          marketplaceId: String, 
          isCapsule: Boolean,
          priceStartRange: Float,
          priceEndRange: Float,
          timestampCreateStartRange: Date,
          timestampCreateEndRange: Date,
          priceSortOrder: String,
          timestampCreateSortOrder: String,
          listedSortOrder: String,
          isCapsuleSortOrder: String,
        ): NftEntitiesConnection
      }
    `,
    resolvers: {
      Query: {
        distinctSerieNfts: async (_query, args, context, resolveInfo) => {
          const listed = sql.value(args.listed)
          const owner = sql.value(args.owner)
          const marketplaceId = sql.value(args.marketplaceId)
          const isCapsule = sql.value(args.isCapsule)
          const priceStartRange = sql.value(args.priceStartRange)
          const priceEndRange = sql.value(args.priceEndRange)
          const timestampCreateStartRange = sql.value(args.timestampCreateStartRange)
          const timestampCreateEndRange = sql.value(args.timestampCreateEndRange)
          const priceSortOrder = sql.value(args.priceSortOrder)
          const timestampCreateSortOrder = sql.value(args.timestampCreateSortOrder)
          const listedSortOrder = sql.value(args.listedSortOrder)
          const isCapsuleSortOrder = sql.value(args.isCapsuleSortOrder)
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
              ${priceStartRange.value !== undefined ? sql.fragment` AND price_rounded >= ${priceStartRange}` : sql.fragment``}
              ${priceEndRange.value !== undefined ? sql.fragment` AND price_rounded <= ${priceEndRange}` : sql.fragment``}
              ${timestampCreateStartRange.value !== undefined ? sql.fragment` AND timestamp_create >= ${timestampCreateStartRange}` : sql.fragment``}
              ${timestampCreateEndRange.value !== undefined ? sql.fragment` AND timestamp_create <= ${timestampCreateEndRange}` : sql.fragment``}
            )`,
            (_tableAlias, queryBuilder) => {
              if (listedSortOrder.value !== undefined){
                if (listedSortOrder.value === "desc") queryBuilder.orderBy(sql.fragment`listed`, false); else queryBuilder.orderBy(sql.fragment`listed`);
              }
              if (isCapsuleSortOrder.value !== undefined){
                if (isCapsuleSortOrder.value === "desc") queryBuilder.orderBy(sql.fragment`is_capsule`, false); else queryBuilder.orderBy(sql.fragment`is_capsule`);
              }
              if (priceSortOrder.value !== undefined){
                if (priceSortOrder.value === "desc") queryBuilder.orderBy(sql.fragment`price_rounded`, false); else queryBuilder.orderBy(sql.fragment`price_rounded`);
              }
              if (timestampCreateSortOrder.value !== undefined){
                if (timestampCreateSortOrder.value === "desc") queryBuilder.orderBy(sql.fragment`timestamp_create`, false); else queryBuilder.orderBy(sql.fragment`timestamp_create`);
              }
            }
          )
        },
      }
    },
  };
});