table! {
    channel (uri) {
        uri -> Text,
        name -> Text,
    }
}

table! {
    episode (id) {
        id -> Integer,
        channel_uri -> Text,
        title -> Text,
        uri -> Text,
        current_time -> Nullable<Integer>,
        is_finish -> Bool,
    }
}

joinable!(episode -> channel (channel_uri));

allow_tables_to_appear_in_same_query!(
    channel,
    episode,
);
