table! {
    channel (id) {
        id -> Integer,
        uri -> Text,
        name -> Text,
    }
}

table! {
    episode (id) {
        id -> Integer,
        channel_id -> Integer,
        title -> Text,
        uri -> Text,
        current_time -> Nullable<Integer>,
        is_finish -> Bool,
    }
}

joinable!(episode -> channel (channel_id));

allow_tables_to_appear_in_same_query!(
    channel,
    episode,
);
