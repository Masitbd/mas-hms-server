// import { Request, Response } from 'express';
// import httpStatus from 'http-status';
// import catchAsync from '../../../shared/catchAsync';
// import sendResponse from '../../../shared/sendResponse';
// import { journalEntryService } from './journalEntry.service';

// const restoreFailedJournalEntry = catchAsync(
//   async (req: Request, res: Response) => {
//     const result = await journalEntryService.restoreFailedEntry();
//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: 'Testing',
//       data: result,
//     });
//   }
// );

// export const JournalEntryController = {
//   restoreFailedJournalEntry,
// };
