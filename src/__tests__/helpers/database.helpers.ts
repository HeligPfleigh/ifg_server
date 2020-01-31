import { testdb } from "../fixtures/datasources/testdb.datasource";
import {
  ActionRepository,
  EvaluationRepository,
  UserRepository,
  FeedbackRepository,
  FirebaseRepository,
  NotificationRepository,
} from "../../repositories";

export async function givenEmptyDatabase() {
  const userRepository: UserRepository = new UserRepository(testdb);
  const actionRepository: ActionRepository = new ActionRepository(testdb);
  const evaluationRepository: EvaluationRepository = new EvaluationRepository(
    testdb,
    async () => userRepository
  );
  const feedbackRepository: FeedbackRepository = new FeedbackRepository(
    testdb,
    async () => userRepository,
  );
  const firebaseRepository: FirebaseRepository = new FirebaseRepository(testdb);
  const notificationRepository: NotificationRepository
    = new NotificationRepository(testdb);

  await userRepository.deleteAll();
  await evaluationRepository.deleteAll();
  await actionRepository.deleteAll();
  await feedbackRepository.deleteAll();
  await firebaseRepository.deleteAll();
  await notificationRepository.deleteAll();
};

export function givenUser() {
  return {
    "email": "tuan.tran@mttjsc.com",
    "username": "tuan.tran",
    "password": "Admin123"
  };
};
