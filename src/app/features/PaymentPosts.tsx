import { Descriptions, Skeleton, Table, Tooltip } from "antd";
import { Payment, Post } from "laerte_fernandes-sdk";

interface PaymentPostsProps {
  loading?: boolean;
  posts: Payment.PostWithEarnings[];
}

export default function PaymentPosts(props: PaymentPostsProps) {
  // if (props.loading) {
  //   return <Skeleton title={false} />;
  // }
  return (
    <>
      <Table<Post.WithEarnings>
        loading={props.loading}
        rowKey={"id"}
        dataSource={props.posts}
        pagination={false}
        columns={[
          {
            responsive: ["xs"],
            title: "Posts",
            render(post: Post.WithEarnings) {
              return (
                <Descriptions column={1}>
                  <Descriptions.Item label={"Título"}>
                    {post.title}
                  </Descriptions.Item>
                  <Descriptions.Item label={"Preço por palavra"}>
                    {post.earnings.pricePerWord.toLocaleString("pt-br", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 2,
                    })}
                  </Descriptions.Item>
                  <Descriptions.Item label={"Palavras no post"}>
                    {post.earnings.words}
                  </Descriptions.Item>
                  <Descriptions.Item label={"Ganho no post"}>
                    {post.earnings.totalAmount.toLocaleString("pt-br", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 2,
                    })}
                  </Descriptions.Item>
                </Descriptions>
              );
            },
          },
          {
            dataIndex: "title",
            responsive: ["sm"],
            title: "Post",
            ellipsis: true,
            width: 300,
            render(value: string) {
              return <Tooltip title={value}>{value}</Tooltip>;
            },
          },
          {
            dataIndex: "earnings.pricePerWord".split("."),
            responsive: ["sm"],
            title: "Preço por palavra",
            align: "right",
            width: 150,
            render(price: number) {
              return price.toLocaleString("pt-br", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 2,
              });
            },
          },
          {
            dataIndex: "earnings.words".split("."),
            responsive: ["sm"],
            title: "Palavras no post",
            width: 150,
            align: "right",
          },
          {
            dataIndex: "earnings.totalAmount".split("."),
            responsive: ["sm"],
            title: "Total ganho neste post",
            align: "right",
            width: 170,
          },
        ]}
      />
    </>
  );
}
