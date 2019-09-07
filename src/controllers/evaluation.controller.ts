import {repository} from '@loopback/repository';
import {post, param, get, requestBody} from '@loopback/rest';
import {
  authenticate,
  AuthenticationBindings,
  UserProfile,
} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  EvaluationSchema,
  EvaluationRequestBody,
  DetailStatisticSchema,
  DetailEvaluationStatisticResponse,
  OverallStatisticSchema,
  OverallStatisticResponse,
} from './specs/evaluation.specs';
import {
  validateSaveEvaluation,
  validateEvaluationType,
} from '../services/validator';
import * as Enum from '../services/enum';
import {Evaluation} from '../models';
import {UserNamespace} from './specs/user-controller.specs';
import {EvaluationRepository, UserRepository} from '../repositories';

export class EvaluationController {
  constructor(
    @repository(EvaluationRepository)
    public evaluationRepository: EvaluationRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @post('/evaluations', {
    responses: {
      '200': {
        description: 'Evaluation model instance',
        content: {'application/json': {schema: EvaluationSchema}},
      },
    },
  })
  @authenticate('jwt')
  async create(
    @requestBody(EvaluationRequestBody)
    evaluation: Omit<Evaluation, 'id'>,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<Evaluation> {
    const {id} = currentUserProfile;
    const newEvaluation = {...evaluation, userId: id};
    validateSaveEvaluation(evaluation);
    return this.evaluationRepository.create(newEvaluation);
  }

  @get('/evaluations/{type}', {
    responses: {
      '200': {
        description: 'Statistic by evaluation type',
        content: {'application/json': {schema: DetailStatisticSchema}},
      },
    },
  })
  @authenticate('jwt')
  async getStatisticByType(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.path.string('type') evaluationType: string,
  ): Promise<DetailEvaluationStatisticResponse> {
    const {id} = currentUserProfile;
    let responses: DetailEvaluationStatisticResponse = {};
    validateEvaluationType(evaluationType);

    let filter;
    if (evaluationType === 'overall') {
      filter = {where: {userId: {like: id}}};
    } else {
      filter = {where: {userId: {like: id}, evaluationType}};
    }

    const evaluations = await this.evaluationRepository.find(filter);

    if (evaluations.length) {
      const averageScore =
        evaluations.reduce((acc, evaluation) => acc + evaluation.score, 0) /
        evaluations.length;
      const affections = evaluations.map(evaluation => {
        return {
          score: evaluation.score,
          tags: evaluation.labelTag ? evaluation.labelTag : undefined,
          factors: evaluation.influentFactor,
        };
      });
      responses = {
        score: averageScore,
        affections,
      };
    }
    return responses;
  }

  @get('/evaluations/statistic', {
    responses: {
      '200': {
        description: 'Overall evaluation statistic',
        content: {'application/json': {schema: OverallStatisticSchema}},
      },
    },
  })
  @authenticate('jwt')
  async getOverallStatistic(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<OverallStatisticResponse> {
    const {id} = currentUserProfile;
    const evaluations = await this.evaluationRepository.find({
      where: {userId: {like: id}},
    });

    const getAverage = (evals: Evaluation[]) => {
      if (evals.length === 0) return undefined;
      let sum = 0;
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < evals.length; i++) {
        sum += evals[i].score;
      }
      return sum / evals.length;
    };
    const overall = getAverage(evaluations);
    const other = getAverage(
      evaluations.filter(
        evaluation => evaluation.evaluationType === Enum.EvaluationType.OTHER,
      ),
    );
    const intakes = getAverage(
      evaluations.filter(
        evaluation => evaluation.evaluationType === Enum.EvaluationType.INTAKES,
      ),
    );
    const activities = getAverage(
      evaluations.filter(
        evaluation =>
          evaluation.evaluationType === Enum.EvaluationType.ACTIVITIES,
      ),
    );
    const relationships = getAverage(
      evaluations.filter(
        evaluation =>
          evaluation.evaluationType === Enum.EvaluationType.RELATIONSHIPS,
      ),
    );

    const owner = await this.userRepository.findById(id);

    return {
      user: new UserNamespace.UserProfile(owner),
      score: {
        overall,
        other,
        intakes,
        activities,
        relationships,
      },
    };
  }
}
