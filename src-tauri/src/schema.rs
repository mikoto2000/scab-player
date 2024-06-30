// @generated automatically by Diesel CLI.

diesel::table! {
    channel (uri) {
        uri -> Text,
        name -> Text,
    }
}

diesel::table! {
    episode (id) {
        id -> Integer,
        channel_uri -> Text,
        title -> Text,
        uri -> Text,
        current_time -> Nullable<Integer>,
        is_finish -> Bool,
        cache_uri -> Nullable<Text>,
    }
}

diesel::joinable!(episode -> channel (channel_uri));

diesel::allow_tables_to_appear_in_same_query!(
    channel,
    episode,
);
