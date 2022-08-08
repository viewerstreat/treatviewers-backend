import {FastifyPluginAsync} from 'fastify';
import {addClipViewHandler, createClipHandler, getClipHandler} from './clip.handler';
import {
  AddViewReqOpts,
  AddViewRequest,
  CreateClipRequest,
  CreateClipRequestOpts,
  GetClipRequest,
  GetClipRequestOpts,
} from './clip.schema';

const clipRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // create clip
  fastify.post<CreateClipRequest>('/', CreateClipRequestOpts, createClipHandler);

  // get clip
  fastify.get<GetClipRequest>('/', GetClipRequestOpts, getClipHandler);

  // add clip view
  fastify.post<AddViewRequest>('/addView', AddViewReqOpts, addClipViewHandler);
};

export default clipRoute;
