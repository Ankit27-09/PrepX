import express, { Request, Response } from 'express';
import multer from 'multer';
import {prisma} from '../client';
import { generatePodcastScript } from '../utils/groqService';
import { generateAvatarVideo, fetchAvailableAvatars } from '../utils/heygenService';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Get available HeyGen avatars
router.get('/avatars', async (req: Request, res: Response) => {
  try {
    console.log('🎭 Fetching HeyGen avatars...');
    
    const avatarsData = await fetchAvailableAvatars();
    
    res.json({
      success: true,
      data: avatarsData,
    });
  } catch (error: any) {
    console.error('Get avatars error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch avatars',
    });
  }
});

// Get all podcasts
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    console.log('📊 Fetching all podcasts');

    const podcasts = await prisma.podcast.findMany({
      take: parseInt(limit as string),
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📊 Found ${podcasts.length} podcasts`);

    res.json({
      success: true,
      data: podcasts,
    });
  } catch (error) {
    console.error('Get podcasts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch podcasts',
    });
  }
});

// Get single podcast
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const podcast = await prisma.podcast.findUnique({
      where: { id: req.params.id },
    });

    if (!podcast) {
      return res.status(404).json({
        success: false,
        error: 'Podcast not found',
      });
    }

    return res.json({
      success: true,
      data: podcast,
    });
  } catch (error) {
    console.error('Get podcast error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch podcast',
    });
  }
});

// Create new podcast
router.post('/', upload.single('knowledgeFile'), async (req: Request, res: Response) => {
  try {
    const { title, description, length, knowledgeText } = req.body;

    if (!title || !length || (!knowledgeText && !req.file)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, length, and knowledge base',
      });
    }

    // Get knowledge base content
    let knowledgeBase = knowledgeText || '';
    if (req.file) {
      knowledgeBase = req.file.buffer.toString('utf-8');
    }

    // Create podcast record
    const podcast = await prisma.podcast.create({
      data: {
        title,
        description: description || '',
        knowledgeBase,
        length,
        status: 'pending',
      },
    });

    // Start async processing
    processPodcast(podcast.id);

    return res.status(201).json({
      success: true,
      data: podcast,
      message: 'Podcast creation started. Processing in background.',
    });
  } catch (error) {
    console.error('Create podcast error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create podcast',
    });
  }
});

// Delete podcast
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const podcast = await prisma.podcast.findUnique({
      where: { id: req.params.id },
    });

    if (!podcast) {
      return res.status(404).json({
        success: false,
        error: 'Podcast not found',
      });
    }

    await prisma.podcast.delete({
      where: { id: req.params.id },
    });

    return res.json({
      success: true,
      message: 'Podcast deleted successfully',
    });
  } catch (error) {
    console.error('Delete podcast error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete podcast',
    });
  }
});

// Background processing function
async function processPodcast(podcastId: string) {
  try {
    await prisma.podcast.update({
      where: { id: podcastId },
      data: { status: 'processing' },
    });

    const podcast = await prisma.podcast.findUnique({
      where: { id: podcastId },
    });
    if (!podcast) throw new Error('Podcast not found');

    console.log(`🎙️ Processing podcast ${podcastId}: ${podcast.title}`);

    // Step 1: Generate script
    console.log('📝 Generating script...');
    const script = await generatePodcastScript(podcast.knowledgeBase, podcast.length);
    await prisma.podcast.update({
      where: { id: podcastId },
      data: { script },
    });

    // Step 2: Generate video with audio
    console.log('🎥 Generating video...');
    const videoPath = await generateAvatarVideo(script, podcastId);

    await prisma.podcast.update({
      where: { id: podcastId },
      data: {
        videoPath,
        audioPath: videoPath, // HeyGen provides both video and audio
      },
    });

    // Update status to completed
    await prisma.podcast.update({
      where: { id: podcastId },
      data: { status: 'completed' },
    });

    console.log(`✅ Podcast ${podcastId} completed successfully`);
  } catch (error) {
    console.error(`❌ Error processing podcast ${podcastId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    await prisma.podcast.update({
      where: { id: podcastId },
      data: {
        status: 'error',
        errorMessage,
      },
    });
  }
}

export default router;
