import {makeExtendSchemaPlugin, gql} from 'graphile-utils';

export const PgAggregateTransfer =  makeExtendSchemaPlugin((build) => {
  const { pgSql: sql, inflection } = build;
  return {
    typeDefs: gql`
      extend type Query {
        mostSold(
          typeOfTransaction: String
        ): AggregateResultEntitiesConnection
      },
      extend type Query {
        mostSoldSeries(
          typeOfTransaction: String
        ): AggregateResultEntitiesConnection
      },
      extend type Query {
        topSeller: AggregateResultEntitiesConnection
      },
    `,
    resolvers: {
      Query: {
        mostSold: async (_query, args, context, resolveInfo) => {
          const typeOfTransaction = sql.value(args.typeOfTransaction)
          return resolveInfo.graphile.selectGraphQLResultFromTable(
            sql.fragment`(
              SELECT nft_id as id, count(nft_id) as occurences
              FROM subql_ternoa.nft_transfer_entities
              ${typeOfTransaction.value !== undefined ? sql.fragment`WHERE type_of_transaction=${typeOfTransaction}` : sql.fragment`WHERE type_of_transaction='sale'`}
              GROUP BY nft_id
            )`,
            () => {}
          )
        },
        mostSoldSeries: async (_query, args, context, resolveInfo) => {
          const typeOfTransaction = sql.value(args.typeOfTransaction)
          return resolveInfo.graphile.selectGraphQLResultFromTable(
            sql.fragment`(
              SELECT series_id as id, count(series_id) as occurences
              FROM subql_ternoa.nft_transfer_entities
              ${typeOfTransaction.value !== undefined ? sql.fragment`WHERE type_of_transaction=${typeOfTransaction}` : sql.fragment`WHERE type_of_transaction='sale'`}
              GROUP BY series_id
            )`,
            () => {}
          )
        },
        topSeller: async (_query, args, context, resolveInfo) => {
          return resolveInfo.graphile.selectGraphQLResultFromTable(
            sql.fragment`(
              SELECT nft_transfer_entities.from as id, count(nft_transfer_entities.from) as occurences
              FROM subql_ternoa.nft_transfer_entities
              WHERE type_of_transaction='sale'
              GROUP BY nft_transfer_entities.from
            )`,
            () => {}
          )
        },
      }
    },
  };
});