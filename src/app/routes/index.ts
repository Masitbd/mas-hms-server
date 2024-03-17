import express from 'express';
import { BacteriaRoutes } from '../modules/bacteria/bacteria.route';
import { ConditionRoutes } from '../modules/condition/condition.routes';
import { DepartmentRoutes } from '../modules/departments/departments.routes';
import { DoctorRoutes } from '../modules/doctor/doctor.routes';
import { HospitalGroupRoutes } from '../modules/hospitalGroup/hospitalGroup.routes';
import { OrderRoutes } from '../modules/order/order.routes';
import { PatientRoute } from '../modules/patient/patient.route';
import { PdrvRoutes } from '../modules/pdrv/pdrv.routes';
import { SensitivityRoutes } from '../modules/sensitivity/sensitivity.routes';
import { SpecimenRoutes } from '../modules/specimen/specimen.routes';
import { TestRoutes } from '../modules/test/test.routes';
import { TransactionRoute } from '../modules/transaction/transaction.route';
import { VacuumRoutes } from '../modules/vacuumTube/vacuumTube.routes';

const router = express.Router();
const moduleRoutes = [
  {
    path: '/departments',
    route: DepartmentRoutes.routes,
  },
  {
    path: '/hospitalGroup',
    route: HospitalGroupRoutes.routes,
  },
  {
    path: '/sensitivity',
    route: SensitivityRoutes.routes,
  },
  {
    path: '/condition',
    route: ConditionRoutes.routes,
  },
  {
    path: '/pdrv',
    route: PdrvRoutes.routes,
  },
  {
    path: '/specimen',
    route: SpecimenRoutes.routes,
  },
  {
    path: '/test-tube',
    route: VacuumRoutes.routes,
  },
  {
    path: '/doctor',
    route: DoctorRoutes.routes,
  },
  {
    path: '/bacteria',
    route: BacteriaRoutes.routes,
  },
  {
    path: '/test',
    route: TestRoutes.routes,
  },
  {
    path: '/transaction',
    route: TransactionRoute.routes,
  },
  {
    path: '/patient',
    route: PatientRoute.routes,
  },
  {
    path: '/order',
    route: OrderRoutes.routes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
