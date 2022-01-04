import { User } from "laerte_fernandes-sdk";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import * as UserActions from "../store/User.reducer";

export default function useUsers() {
  const dispatch = useDispatch();

  const users = useSelector((state: RootState) => state.user.list);

  const editors = useSelector((state: RootState) =>
    state.user.list.filter((user) => {
      return user.role === "EDITOR";
    })
  );

  const fetching = useSelector((state: RootState) => state.user.fetching);

  const fetchUsers = useCallback(() => {
    dispatch(UserActions.getAllUsers());
  }, [dispatch]);

  const toggleUserStatus = useCallback(
    async (user: User.Detailed | User.Summary) => {
      await dispatch(UserActions.toggleUserStatus(user));
      dispatch(UserActions.getAllUsers());
    },
    [dispatch]
  );

  return {
    fetchUsers,
    users,
    editors,
    fetching,
    toggleUserStatus,
  };
}