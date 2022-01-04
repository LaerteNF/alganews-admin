import {
  Form,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Input,
  Divider,
  Tabs,
  Descriptions,
  Space,
  Tooltip,
  Skeleton,
  notification,
} from "antd";
import { useForm } from "antd/lib/form/Form";
import { Payment } from "laerte_fernandes-sdk";
import moment, { Moment } from "moment";
import useUsers from "../../core/hooks/useUsers";
import {
  DeleteOutlined,
  PlusOutlined,
  InfoCircleFilled,
} from "@ant-design/icons";
import CurrencyInput from "../components/CurrencyInput";
import { useCallback, useEffect, useState } from "react";
import { FieldData } from "rc-field-form/lib/interface";
import debounce from "lodash.debounce";
import usePayment from "../../core/hooks/usePayment";
import transformIntoBrl from "../../core/utils/transformIntoBrl";
import AskForPaymentPreview from "./AskForPaymentPreview";
import CustomError from "laerte_fernandes-sdk/dist/CustomError";
import { BusinessError } from "laerte_fernandes-sdk/dist/errors";
import { useHistory } from "react-router";

export default function PaymentForm() {
  const [form] = useForm<Payment.Input>();
  const { editors, fetchUsers, fetching } = useUsers();
  const history = useHistory();
  const {
    fetchPaymentPreview,
    paymentPreview,
    fetchingPaymentPreview,
    clearPaymentPreview,
    schedulePayment,
    schedulingPayment,
  } = usePayment();
  const [scheduledTo, setScheduledTo] = useState("");
  const [paymentPreviewError, setPaymentPreviewError] = useState<CustomError>();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateScheduledDate = useCallback(() => {
    const { scheduledTo } = form.getFieldsValue();
    setScheduledTo(scheduledTo);
  }, [form]);

  const clearPaymentPreviewError = useCallback(() => {
    setPaymentPreviewError(undefined);
  }, []);

  const getPaymentPreview = useCallback(async () => {
    const { accountingPeriod, bonuses, payee } = form.getFieldsValue();
    if (payee && accountingPeriod) {
      if (payee.id && accountingPeriod.endsOn && accountingPeriod.startsOn) {
        try {
          await fetchPaymentPreview({
            payee,
            accountingPeriod,
            bonuses: bonuses || [],
          });
          clearPaymentPreviewError();
        } catch (error) {
          clearPaymentPreview();
          if (error instanceof BusinessError) {
            setPaymentPreviewError(error);
          }
          throw error;
        }
      } else {
        clearPaymentPreview();
        clearPaymentPreviewError();
      }
    }
  }, [
    form,
    fetchPaymentPreview,
    clearPaymentPreview,
    clearPaymentPreviewError,
  ]);

  const handleFormChange = useCallback(
    ([field]: FieldData[]) => {
      if (Array.isArray(field?.name)) {
        if (
          field.name.includes("payee") ||
          field.name.includes("_accountingPeriod") ||
          field.name.includes("bonuses")
        ) {
          getPaymentPreview();
        }

        if (field.name.includes("scheduledTo")) {
          updateScheduledDate();
        }
      }
    },
    [getPaymentPreview, updateScheduledDate]
  );

  // só executa quando passa de 1 segundo sem ser chamada novamente
  const debounceHandleFormChange = debounce(handleFormChange, 1000);

  const handleFormSubmit = useCallback(
    async (form: Payment.Input) => {
      const paymentDto: Payment.Input = {
        accountingPeriod: form.accountingPeriod,
        payee: form.payee,
        bonuses: form.bonuses || [],
        scheduledTo: moment(form.scheduledTo).format("YYYY-MM-DD"),
      };

      await schedulePayment(paymentDto);

      notification.success({
        message: "Pagamento agendado com sucesso",
      });

      history.push("/pagamentos");
    },
    [schedulePayment, history]
  );

  return (
    <Form<Payment.Input>
      form={form}
      layout={"vertical"}
      onFieldsChange={debounceHandleFormChange}
      onFinish={handleFormSubmit}
    >
      <Row gutter={24}>
        <Col xs={24} lg={8}>
          <Form.Item
            label={"Editor"}
            name={["payee", "id"]}
            rules={[{ required: true, message: "O campo é obrigatório" }]}
          >
            <Select
              showSearch
              loading={fetching}
              placeholder={
                fetching ? "Carregando editores..." : "Selecione um editor"
              }
              filterOption={(input, option) => {
                return (
                  option?.children
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0 ||
                  (option?.children as string)
                    .toLowerCase()
                    .indexOf(input.toLocaleLowerCase()) >= 0
                );
              }}
            >
              {editors.map((user) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} lg={8}>
          <Form.Item hidden name={["accountingPeriod", "startsOn"]}>
            <Input hidden />
          </Form.Item>
          <Form.Item hidden name={["accountingPeriod", "endsOn"]}>
            <Input hidden />
          </Form.Item>
          <Form.Item
            label={"Período"}
            name={"_accountingPeriod"}
            rules={[{ required: true, message: "O campo é obrigatório" }]}
          >
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              format={"DD/MM/YYYY"}
              onChange={(date) => {
                if (date !== null) {
                  const [startsOn, endsOn] = date as Moment[];
                  form.setFieldsValue({
                    accountingPeriod: {
                      startsOn: startsOn.format("YYYY-MM-DD"),
                      endsOn: endsOn.format("YYYY-MM-DD"),
                    },
                  });
                } else {
                  form.setFieldsValue({
                    accountingPeriod: {
                      startsOn: undefined,
                      endsOn: undefined,
                    },
                  });
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} lg={8}>
          <Form.Item
            label={"Agendamento"}
            name={"scheduledTo"}
            rules={[{ required: true, message: "O campo é obrigatório" }]}
          >
            <DatePicker
              disabledDate={(date) => {
                return (
                  date.isBefore(moment()) ||
                  date.isAfter(moment().add(7, "days"))
                );
              }}
              style={{ width: "100%" }}
              format={"DD/MM/YYYY"}
            />
          </Form.Item>
        </Col>
        <Divider />
        <Col xs={24} lg={12}>
          {fetchingPaymentPreview ? (
            <>
              <Skeleton />
              <Skeleton title={false} />
            </>
          ) : !paymentPreview ? (
            <AskForPaymentPreview error={paymentPreviewError} />
          ) : (
            <Tabs defaultActiveKey={"payment"}>
              <Tabs.TabPane tab={"Demonstrativo"} key={"payment"}>
                <Descriptions
                  labelStyle={{ width: 160 }}
                  bordered
                  size={"small"}
                  column={1}
                >
                  <Descriptions.Item label={"Editor"}>
                    {paymentPreview?.payee.name}
                  </Descriptions.Item>
                  <Descriptions.Item label={"Período"}>
                    <Space>
                      {moment(paymentPreview?.accountingPeriod.startsOn).format(
                        "DD/MM/YYYY"
                      )}
                      <span>à</span>
                      {moment(paymentPreview?.accountingPeriod.endsOn).format(
                        "DD/MM/YYYY"
                      )}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label={"Agendamento"}>
                    {scheduledTo && moment(scheduledTo).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                  <Descriptions.Item label={"Palavras"}>
                    {paymentPreview?.earnings.words}
                  </Descriptions.Item>
                  <Descriptions.Item label={"Ganhos"}>
                    {transformIntoBrl(paymentPreview?.grandTotalAmount)}
                  </Descriptions.Item>
                  {paymentPreview?.bonuses.map((bonus, index) => (
                    <Descriptions.Item
                      label={
                        <>
                          <Space>
                            {`Bônus ${index + 1}`}{" "}
                            <Tooltip title={bonus.title}>
                              <InfoCircleFilled style={{ color: "#09f" }} />
                            </Tooltip>
                          </Space>
                        </>
                      }
                      key={index}
                    >
                      {transformIntoBrl(bonus.amount)}
                    </Descriptions.Item>
                  ))}
                  <Descriptions.Item label={"Ganhos de Posts"}>
                    {transformIntoBrl(paymentPreview?.earnings.totalAmount)}
                  </Descriptions.Item>
                </Descriptions>
              </Tabs.TabPane>
              <Tabs.TabPane tab={"Dados bancários"} key={"bankAccount"}>
                <Descriptions
                  bordered
                  labelStyle={{ width: 160 }}
                  size={"small"}
                  column={1}
                >
                  <Descriptions.Item label={"Código do Banco"}>
                    {paymentPreview?.bankAccount.bankCode}
                  </Descriptions.Item>
                  <Descriptions.Item label={"Número da conta"}>
                    {paymentPreview?.bankAccount.number}
                  </Descriptions.Item>
                  <Descriptions.Item label={"Dígito da conta"}>
                    {paymentPreview?.bankAccount.digit}
                  </Descriptions.Item>
                  <Descriptions.Item label={"Agência"}>
                    {paymentPreview?.bankAccount.agency}
                  </Descriptions.Item>
                  <Descriptions.Item label={"Tipo de conta"}>
                    {paymentPreview?.bankAccount.type === "CHECKING"
                      ? "Conta corrente"
                      : "Conta poupança"}
                  </Descriptions.Item>
                </Descriptions>
              </Tabs.TabPane>
            </Tabs>
          )}
        </Col>
        <Col xs={24} lg={12}>
          <Form.List name={"bonuses"}>
            {(fields, { add, remove }) => {
              return (
                <>
                  {fields.map((field) => {
                    return (
                      <Row gutter={24} key={field.name}>
                        <Col xs={24} lg={14}>
                          <Form.Item
                            label={"Descrição"}
                            {...field}
                            name={[field.name, "title"]}
                            rules={[
                              {
                                required: true,
                                message: "O campo é obrigatório",
                              },
                            ]}
                          >
                            <Input placeholder={"E.g.: 1 milhão de views"} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={6}>
                          <Form.Item
                            label={"Valor"}
                            initialValue={0}
                            {...field}
                            name={[field.name, "amount"]}
                            rules={[
                              {
                                required: true,
                                message: "O campo é obrigatório",
                              },
                            ]}
                          >
                            <CurrencyInput
                              onChange={(a, amount) => {
                                const { bonuses } = form.getFieldsValue();
                                form.setFieldsValue({
                                  bonuses: bonuses?.map((bonus, index) => {
                                    return index === field.name
                                      ? { title: bonus.title, amount }
                                      : bonus;
                                  }),
                                });
                              }}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={4}>
                          <Form.Item label={"Remover"}>
                            <Button
                              onClick={() => remove(field.name)}
                              icon={<DeleteOutlined />}
                              danger
                              size={"small"}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    );
                  })}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Adicionar bônus
                  </Button>
                </>
              );
            }}
          </Form.List>
        </Col>
      </Row>
      <Row justify="end">
        <Button type={"primary"} htmlType="submit" loading={schedulingPayment}>
          Cadastrar agendamento
        </Button>
      </Row>
    </Form>
  );
}
